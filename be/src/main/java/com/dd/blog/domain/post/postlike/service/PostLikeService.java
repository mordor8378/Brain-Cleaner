package com.dd.blog.domain.post.postlike.service;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.post.postlike.dto.LikeResponseDto;
import com.dd.blog.domain.post.postlike.entity.PostLike;
import com.dd.blog.domain.post.postlike.repository.PostLikeRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // LIKE
    @Transactional
    public LikeResponseDto addLike(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if (postLikeRepository.findByUserAndPost(user, post).isPresent()) {
            return new LikeResponseDto(postId, (long) post.getLikeCount(), true); // 이미 좋아요 되어있음
        }

        postLikeRepository.save(new PostLike(post, user));
        post.increaseLikeCount(); // 게시글의 좋아요 수 증가 (메서드 없으면 추가 필요)

        return new LikeResponseDto(postId, (long) post.getLikeCount(), true);
    }

    // UNLIKE
    @Transactional
    public LikeResponseDto deleteLike(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        PostLike postLike = postLikeRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new IllegalArgumentException("좋아요 이력이 존재하지 않습니다."));

        postLikeRepository.delete(postLike);
        post.decreaseLikeCount(); // 게시글의 좋아요 수 감소 (메서드 없으면 추가 필요)

        return new LikeResponseDto(postId, (long) post.getLikeCount(), false);
    }

    @Transactional(readOnly = true)
    public LikeResponseDto checkLike(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));
        boolean isLiked = postLikeRepository.existsByUserAndPost(user, post);

        return new LikeResponseDto(postId, (long) post.getLikeCount(), isLiked);
    }
}
