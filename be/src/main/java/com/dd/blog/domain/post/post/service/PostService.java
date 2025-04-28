package com.dd.blog.domain.post.post.service;

import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.category.repository.CategoryRepository;
import com.dd.blog.domain.post.event.PostCreatedEvent;
import com.dd.blog.domain.post.post.dto.PostPatchRequestDto;
import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.post.verification.dto.VerificationRequestDto;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;
import com.dd.blog.domain.post.verification.service.VerificationService;
import com.dd.blog.domain.report.repository.ReportRepository;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.domain.user.follow.repository.FollowRepository;
import com.dd.blog.global.aws.AwsS3Uploader;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final VerificationService verificationService;
    private final VerificationRepository verificationRepository;
    private final ReportRepository reportRepository;
    private final AwsS3Uploader awsS3Uploader;

    private void checkAdminAuthority() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("로그인이 필요합니다.");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN")); // 실제 사용하는 Role 이름 확인! (보통 "ROLE_ADMIN")

        if (!isAdmin) {
            throw new AccessDeniedException("관리자 권한이 없습니다.");
        }
    }



    // CREATE
    // 게시글 CREATE
    @Transactional
    public PostResponseDto createPost(Long categoryId, Long userId, PostRequestDto postRequestDto, MultipartFile[] postImages) throws IOException {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        if(category.getId() == 4L)
            checkAdminAuthority();

        // 기존 이미지 URL 배열 (null이면 빈 배열로 초기화)
        String[] existingImageUrls = postRequestDto.getImageUrl() != null ? postRequestDto.getImageUrl() : new String[0];
        System.out.println("기존 이미지 URL 배열 길이: " + existingImageUrls.length);
        
        // 새로 업로드된 이미지 처리
        List<String> newImageUrlList = new ArrayList<>();
        if (postImages != null && postImages.length > 0) {
            System.out.println("새로 업로드된 이미지 파일 수: " + postImages.length);
            for (MultipartFile postImage : postImages) {
                String uploadedUrl = awsS3Uploader.upload(postImage, "post"); // 각 이미지를 S3에 업로드
                newImageUrlList.add(uploadedUrl); // URL 리스트에 추가
                System.out.println("업로드된 이미지 URL: " + uploadedUrl);
            }
        }

        // 기존 이미지 URL과 새 이미지 URL 결합
        String[] allImageUrls;
        if (existingImageUrls.length > 0 || !newImageUrlList.isEmpty()) {
            // 두 배열 결합
            List<String> combinedList = new ArrayList<>(Arrays.asList(existingImageUrls));
            combinedList.addAll(newImageUrlList);
            allImageUrls = combinedList.toArray(new String[0]);
            System.out.println("최종 이미지 URL 배열 길이: " + allImageUrls.length);
        } else {
            allImageUrls = null;
            System.out.println("이미지 URL이 없습니다.");
        }

        // 기존 이미지 URL과 새 이미지 URL 결합 (중복 제거)
        List<String> combinedList = new ArrayList<>(Arrays.asList(existingImageUrls));
        combinedList.addAll(newImageUrlList);

        // 중복 제거
        List<String> uniqueUrls = new ArrayList<>(new LinkedHashSet<>(combinedList));
        allImageUrls = uniqueUrls.toArray(new String[0]);
        System.out.println("중복 제거 후 최종 이미지 URL 배열 길이: " + allImageUrls.length);

        Post post = Post.builder()
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .imageUrl(allImageUrls)
                .category(category)
                .user(user)
                .detoxTime(postRequestDto.getDetoxTime()) // Integer: 디톡스 시간 (~h)
                .verificationImageUrl(category.getId() == 1L && allImageUrls != null && allImageUrls.length > 0
                        ? allImageUrls[0] : null) // 인증 게시판일 때만 인증 이미지 설정
                .viewCount(0) // 핫게시물 TOP5 위해 재추가
                .build();

        Post savedPost = postRepository.save(post);

        if (categoryId == 1L) {
            VerificationRequestDto verificationRequest = VerificationRequestDto.builder()
                    .userId(userId)
                    .postId(savedPost.getId())
                    .detoxTime(savedPost.getDetoxTime())
                    .build();

            verificationService.createVerification(verificationRequest);
        }

        this.eventPublisher.publishEvent(new PostCreatedEvent(this, savedPost));

        return PostResponseDto.fromEntity(savedPost);
    }


    // READ
    // 전체 게시글 READ
    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts(){
        return postRepository.findAll().stream()
                .map(PostResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 특정 카테고리 게시판 READ
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByCategory(Long categoryId){
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));
        return postRepository.findByCategoryId(categoryId).stream()
                .map(PostResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 팔로잉 대상 게시판 READ
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByFollowing(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        // 유저가 팔로우한 사람들 조회
        List<Follow> followings = followRepository.findByFollower(user);

        // 팔로우한 유저들만 뽑아냄
        List<User> followedUsers = followings.stream()
                .map(Follow::getFollowing)
                .toList();

        // 이 유저들이 쓴 게시글을 모두 조회
        List<Post> posts = postRepository.findByUserInOrderByCreatedAtDesc(followedUsers);

        return posts.stream()
                .map(PostResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 게시글 페이지 조회
    @Transactional(readOnly = true)
    public Page<PostResponseDto> getAllPostsPageable(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findAll(pageable);
        return postPage.map(PostResponseDto::fromEntity);
    }

    // 게시글 페이지 조회 (카테고리 ID)
    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPostsByCategoryPageable(Long categoryId, int page, int size) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId, pageable);
        return postPage.map(PostResponseDto::fromEntity);
    }

    // 특정 사용자의 게시물 목록 조회
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        List<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(user);
        return posts.stream()
                .map(PostResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 게시글 1개 READ(상세보기)
    @Transactional(readOnly = true)
    public PostResponseDto getPostById(Long postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        // 조회수 증가
        post.increaseViewCount();
        return PostResponseDto.fromEntity(post);
    }

    // UPDATE
    // 게시글 UPDATE(수정)
    @Transactional
    public PostResponseDto updatePost(Long postId, PostPatchRequestDto postPatchRequestDto, MultipartFile[] postImages) throws IOException{
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        if(post.getCategory().getId() == 4L)
            checkAdminAuthority();

        // 기존 이미지 URL 처리 - DTO에서 가져오거나 기존 게시글에서 가져옴
        String[] existingImageUrls;
        if (postPatchRequestDto.getImageUrl() != null && postPatchRequestDto.getImageUrl().length > 0) {
            existingImageUrls = postPatchRequestDto.getImageUrl();
        } else {
            existingImageUrls = post.getImageUrl(); // 기존 게시글의 이미지 URL
        }
        
        if (existingImageUrls == null) {
            existingImageUrls = new String[0];
        }
        
        System.out.println("업데이트: 기존 이미지 URL 배열 길이: " + existingImageUrls.length);
        
        // 새로 업로드된 이미지 처리
        List<String> newImageUrlList = new ArrayList<>();
        if (postImages != null && postImages.length > 0) {
            System.out.println("업데이트: 새로 업로드된 이미지 파일 수: " + postImages.length);
            for (MultipartFile postImage : postImages) {
                String uploadedUrl = awsS3Uploader.upload(postImage, "post");
                newImageUrlList.add(uploadedUrl);
                System.out.println("업데이트: 업로드된 이미지 URL: " + uploadedUrl);
            }
        }
        
        // 기존 이미지 URL과 새 이미지 URL 결합
        String[] finalImageUrls;
        if (existingImageUrls.length > 0 || !newImageUrlList.isEmpty()) {
            // 두 배열 결합
            List<String> combinedList = new ArrayList<>(Arrays.asList(existingImageUrls));
            combinedList.addAll(newImageUrlList);
            finalImageUrls = combinedList.toArray(new String[0]);
            System.out.println("업데이트: 최종 이미지 URL 배열 길이: " + finalImageUrls.length);
        } else {
            finalImageUrls = null;
            System.out.println("업데이트: 이미지 URL이 없습니다.");
        }

        post.update(postPatchRequestDto.getTitle(),
                postPatchRequestDto.getContent(),
                finalImageUrls);

        return PostResponseDto.fromEntity(post);
    }

    // DELETE
    // 게시글 DELETE
    @Transactional
    public void deletePost(Long postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        if(post.getCategory().getId() == 4L)
            checkAdminAuthority();

        reportRepository.unlinkReportsFromPost(postId);

        verificationRepository.deleteByPost(post);
        postRepository.delete(post);
    }


    // SEARCH
    // 게시글 SEARCH
    @Transactional(readOnly = true)
    public List<PostResponseDto> searchPosts(String type, String keyword) {
        // PostRepository에서 검색 조건에 맞는 게시글 목록 조회
        List<Post> posts = postRepository.searchByTypeAndKeyword(type, keyword);

        // Entity → DTO 변환 후 결과 리스트 반환
        return posts.stream()
                .map(PostResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
