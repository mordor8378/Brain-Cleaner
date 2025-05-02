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
import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;
import com.dd.blog.domain.post.verification.service.VerificationService;
import com.dd.blog.domain.report.repository.ReportRepository;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.domain.user.follow.repository.FollowRepository;
import com.dd.blog.global.aws.AwsS3Uploader;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
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
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 카테고리별 게시글 제한 체크
        if (categoryId == 1L) { // 인증게시판
            if (hasUserPostedVerificationToday(userId)) {
                throw new ApiException(ErrorCode.VERIFICATION_POST_ALREADY_SUBMITTED);
            }
        } else if (categoryId == 2L || categoryId == 3L) { // 정보공유게시판이나 자유게시판
            int postCount = countPostsByUserAndCategoryToday(userId, categoryId);
            if (postCount >= 10) {
                throw new ApiException(ErrorCode.DAILY_POST_LIMIT_EXCEEDED);
            }
        }

        if(category.getId() == 4L)
            checkAdminAuthority();

        // 기존 이미지 URL 배열 (null이면 빈 배열로 초기화)
        String[] existingImageUrls = postRequestDto.getImageUrl() != null ? postRequestDto.getImageUrl() : new String[0];
        
        // 새로 업로드된 이미지 처리
        List<String> newImageUrlList = new ArrayList<>();
        if (postImages != null && postImages.length > 0) {
            for (MultipartFile postImage : postImages) {
                String uploadedUrl = awsS3Uploader.upload(postImage, "post"); // 각 이미지를 S3에 업로드
                newImageUrlList.add(uploadedUrl); // URL 리스트에 추가
            }
        }

        // 기존 이미지 URL과 새 이미지 URL 결합
        List<String> combinedList = new ArrayList<>();

        // 기존 URL 추가 (null 체크)
        if (existingImageUrls != null && existingImageUrls.length > 0) {
            for (String url : existingImageUrls) {
                if (url != null && !url.trim().isEmpty()) {
                    combinedList.add(url);
                }
            }
        }

        // 새 URL 추가
        if (newImageUrlList != null && !newImageUrlList.isEmpty()) {
            for (String url : newImageUrlList) {
                if (url != null && !url.trim().isEmpty()) {
                    combinedList.add(url);
                }
            }
        }

        // 결과 배열 생성
        String[] allImageUrls;
        if (!combinedList.isEmpty()) {
            allImageUrls = combinedList.toArray(new String[0]);
        } else {
            // 인증게시판(카테고리 ID 1)의 경우 이미지가 필수
            if (categoryId == 1L) {
                throw new IllegalArgumentException("인증게시판에는 이미지가 필수입니다.");
            }
            // 다른 게시판은 이미지 없이도 등록 가능 (빈 배열로 설정)
            allImageUrls = new String[0];
        }

        Post post = Post.builder()
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .imageUrl(allImageUrls)
                .category(category)
                .user(user)
                .detoxTime(postRequestDto.getDetoxTime()) // Integer: 디톡스 시간 (~h)
                .verificationImageUrl(
                 categoryId == 1L
                 ? (!newImageUrlList.isEmpty()
                 ? newImageUrlList.get(0)
                 : (existingImageUrls.length > 0
                         ? existingImageUrls[0]
                         : null))
                        : null)
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
    public List<PostResponseDto> getAllPosts() {
        return postRepository.findAll().stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.fromEntity(post);
                    return setVerificationStatus(dto, post);
                })
                .collect(Collectors.toList());
    }

    // 특정 카테고리 게시판 READ
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));
        return postRepository.findByCategoryId(categoryId).stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.fromEntity(post);
                    return setVerificationStatus(dto, post);
                })
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
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.fromEntity(post);
                    return setVerificationStatus(dto, post);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPostsByFollowingPageable(Long userId, int page, int size, String sortField, Sort.Direction direction) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        List<Follow> followings = followRepository.findByFollower(user);
        List<User> followedUsers = followings.stream()
                .map(Follow::getFollowing)
                .toList();

        Sort sort = Sort.by(direction, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        if (followedUsers.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<Post> postPage = postRepository.findByUserIn(followedUsers, pageable);

        return postPage.map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post));
    }

    // 게시글 페이지 조회
    @Transactional(readOnly = true)
    public Page<PostResponseDto> getAllPostsPageable(int page, int size, String sortField, Sort.Direction direction) {
        Sort sort;
        if ("likeCount".equals(sortField)) {
            // 좋아요 수로 정렬할 때는 2차 정렬 기준으로 id를 추가하여 항상 동일한 순서 보장
            sort = Sort.by(direction, sortField).and(Sort.by(Sort.Direction.ASC, "id"));
        } else {
            // 기본적으로는 생성일 기준 정렬
            sort = Sort.by(direction, "createdAt");
        }
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Post> postPage = postRepository.findAll(pageable);
        return postPage.map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post));
    }

    // 게시글 페이지 조회 (카테고리 ID)
    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPostsByCategoryPageable(Long categoryId, int page, int size, String sortField, Sort.Direction direction) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));

        Sort sort;
        if ("likeCount".equals(sortField)) {
            // 좋아요 수로 정렬할 때는 2차 정렬 기준으로 id를 추가하여 항상 동일한 순서 보장
            sort = Sort.by(direction, sortField).and(Sort.by(Sort.Direction.ASC, "id"));
        } else {
            // 기본적으로는 생성일 기준 정렬
            sort = Sort.by(direction, "createdAt");
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Post> postPage = postRepository.findByCategoryId(categoryId, pageable);

        return postPage.map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post));
    }

    // 특정 사용자의 게시물 목록 조회
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        List<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(user);
        return posts.stream()
                .map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post))
                .collect(Collectors.toList());
    }

    // 게시글 1개 READ(상세보기)
    @Transactional(readOnly = true)
    public PostResponseDto getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        // 조회수 증가
        post.increaseViewCount();
        PostResponseDto dto = PostResponseDto.fromEntity(post);
        return setVerificationStatus(dto, post);
    }

    // UPDATE
    // 게시글 UPDATE(수정)
    @Transactional
    public PostResponseDto updatePost(Long postId, PostPatchRequestDto postPatchRequestDto, MultipartFile[] postImages) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        if(post.getCategory().getId() == 4L)
            checkAdminAuthority();

        // 새로 업로드된 이미지 처리
        List<String> newImageUrls = new ArrayList<>();
        System.out.println("업로드할 이미지 개수: " + (postImages != null ? postImages.length : 0));
        
        if (postImages != null && postImages.length > 0) {
            for (MultipartFile postImage : postImages) {
                System.out.println("이미지 업로드 시작: " + postImage.getOriginalFilename());
                String uploadedUrl = awsS3Uploader.upload(postImage, "post");
                System.out.println("이미지 업로드 완료: " + uploadedUrl);
                newImageUrls.add(uploadedUrl);
            }
        }

        // 기존 이미지 URL과 새 이미지 URL 결합
        List<String> combinedImageUrls = new ArrayList<>();
        
        // 기존 이미지 URL 추가 (DTO에서 가져오거나 기존 게시글에서 가져옴)
        String[] existingImageUrls = postPatchRequestDto.getImageUrl() != null ? 
            postPatchRequestDto.getImageUrl() : post.getImageUrl();
        
        System.out.println("기존 이미지 URL 개수: " + (existingImageUrls != null ? existingImageUrls.length : 0));
        System.out.println("새로 업로드된 이미지 URL 개수: " + newImageUrls.size());
        
        if (existingImageUrls != null) {
            for (String url : existingImageUrls) {
                if (url != null && !url.trim().isEmpty()) {
                    combinedImageUrls.add(url);
                }
            }
        }

        // 새로 업로드된 이미지 URL 추가
        combinedImageUrls.addAll(newImageUrls);
        System.out.println("최종 결합된 이미지 URL 개수: " + combinedImageUrls.size());

        // 결과 배열 생성
        String[] finalImageUrls = combinedImageUrls.isEmpty() ? null : combinedImageUrls.toArray(new String[0]);
        System.out.println("최종 이미지 URL 배열: " + Arrays.toString(finalImageUrls));

        // 게시글 업데이트
        post.update(
            postPatchRequestDto.getTitle(),
            postPatchRequestDto.getContent(),
            finalImageUrls
        );

        // 업데이트된 게시글을 저장하고 응답 DTO 생성
        Post updatedPost = postRepository.save(post);
        PostResponseDto responseDto = PostResponseDto.fromEntity(updatedPost);
        responseDto.setImageUrl(finalImageUrls); // 최종 이미지 URL 설정
        
        return responseDto;
    }

    // DELETE
    // 게시글 DELETE
    @Transactional
    public void deletePost(Long postId, Long userId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));

        boolean isAdmin = false;
        try {
            checkAdminAuthority();
            isAdmin = true;
        } catch (AccessDeniedException ignore) { }

        if (!isAdmin && !post.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN);  // 403
        }

        // 연관된 데이터 삭제
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

        // Entity → DTO 변환 후 결과 리스트 반환 (인증 상태 추가)
        return posts.stream()
                .map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> searchPostsPageable(String type, String keyword, int page, int size, String sortField, Sort.Direction direction) {
        Sort sort = Sort.by(direction, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Post> postPage = postRepository.searchByTypeAndKeywordPageable(type, keyword, pageable);
        return postPage.map(post -> setVerificationStatus(PostResponseDto.fromEntity(post), post));
    }

    // 게시글 갯수 제한 헬퍼
    @Transactional(readOnly = true)
    public int countPostsByUserAndCategoryToday(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return (int) postRepository.countByUserIdAndCategoryIdAndCreatedAtBetween(userId, categoryId, startOfDay, endOfDay);
    }

    @Transactional(readOnly = true)
    public boolean hasUserPostedVerificationToday(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        // 인증게시판 카테고리 ID (1L)로 오늘 작성한 게시글 수 확인
        int count = (int) postRepository.countByUserIdAndCategoryIdAndCreatedAtBetween(userId, 1L, startOfDay, endOfDay);

        return count > 0;
    }

    // 인증 상태 설정
    private PostResponseDto setVerificationStatus(PostResponseDto dto, Post post) {
        // 인증 게시판(카테고리 ID: 1)인 경우에만 상태값 설정
        if (post.getCategory().getId() == 1L) {
            // 해당 게시글에 연결된 Verification 조회
            Optional<Verification> verification = verificationRepository.findByPostId(post.getId());

            if (verification.isPresent()) {
                // Verification이 존재하면 상태값 설정
                dto.setStatus(verification.get().getStatus().toString());
            } else {
                // Verification이 없으면 기본값 PENDING 설정
                dto.setStatus(VerificationStatus.PENDING.toString());
            }
        }

        return dto;
    }
}
