package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminPostService {

    private final PostRepository postRepository;

    @Transactional
    public void deletePostByAdmin(Long postId) {
        if(!postRepository.existsById(postId))
            throw new ApiException(ErrorCode.POST_NOT_FOUND);

        postRepository.deleteById(postId);
    }

}
