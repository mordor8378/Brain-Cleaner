package com.dd.blog.domain.post.post.service;

import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.category.repository.CategoryRepository;
import com.dd.blog.domain.post.event.PostCreatedEvent;
import com.dd.blog.domain.post.post.dto.PostPatchRequestDto;
import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.domain.user.follow.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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



    // CREATE
    // 게시글 CREATE
    @Transactional
    public PostResponseDto createPost(Long categoryId, PostRequestDto postRequestDto){
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

        User user = userRepository.findById(postRequestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        Post post = Post.builder()
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .imageUrl(postRequestDto.getImageUrl())
                .category(category)
                .user(user)
                .build();

        Post savedPost = postRepository.save(post);
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
        return PostResponseDto.fromEntity(post);
    }


    // UPDATE
    // 게시글 UPDATE(수정)
    @Transactional
    public PostResponseDto updatePost(Long postId, PostPatchRequestDto postPatchRequestDto){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        post.update(postPatchRequestDto.getTitle(), postPatchRequestDto.getContent(), postPatchRequestDto.getImageUrl());
        return PostResponseDto.fromEntity(post);
    }


    // DELETE
    // 게시글 DELETE
    @Transactional
    public void deletePost(Long postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
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
