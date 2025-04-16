package com.dd.blog.domain.post.post.service;

import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

public abstract class PostService {
    @Transactional(readOnly = true)
    public abstract List<PostResponseDto> getAllPosts();

    @Transactional(readOnly = true)
    public abstract List<PostResponseDto> getPostByCategory(Long categoryId);

    @Transactional(readOnly = true)
    public abstract PostResponseDto getPostById(Long postId);

    @Transactional
    public abstract PostResponseDto createPost(Long categoryId, PostRequestDto postRequestDto);

    @Transactional
    public abstract PostResponseDto updatePost(Long postId, PostRequestDto postRequestDto);

    @Transactional
    public abstract void deletePost(Long postId);
}
