package com.dd.blog.domain.post.comment.service;

import com.dd.blog.domain.post.comment.dto.CommentRequestDto;
import com.dd.blog.domain.post.comment.dto.CommentResponseDto;
import com.dd.blog.domain.post.comment.dto.CommentUpdateResponseDto;
import com.dd.blog.domain.post.comment.entity.Comment;
import com.dd.blog.domain.post.comment.repository.CommentRepository;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;


    // READ
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getAllComments(Long postId){
        // 댓글과 대댓글은 프론트에서 parentId를 활용하여 계층구조처럼 보이게 설정 가능(백엔드에서는 모든댓글을 return)
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));

        List<Comment> comments = commentRepository.findByPostId(postId);

        return comments.stream()
                .map(CommentResponseDto::fromEntity)
                .collect(Collectors.toList());
    };


    // CREATE
    @Transactional
    public CommentResponseDto writeComment(Long postId, CommentRequestDto commentRequestDto, Long userId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        String content = commentRequestDto.getContent();

        Comment parentComment = null;
        if (commentRequestDto.getParentId() != null) {
            parentComment = commentRepository.findById(commentRequestDto.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("부모 댓글을 찾을 수 없습니다."));
        }

        Comment newComment = Comment.builder()
                .post(post)
                .user(user)
                .parent(parentComment)
                .content(content)
                .build();

        commentRepository.save(newComment);
        return CommentResponseDto.fromEntity(newComment);
    };


    // UPDATE
    @Transactional
    public CommentUpdateResponseDto updateComment(Long commentId, CommentRequestDto dto, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("작성자만 수정할 수 있습니다.");
        }

        comment.setContent(dto.getContent()); // 변경감지
        return new CommentUpdateResponseDto(comment.getId(), comment.getContent(), comment.getUpdatedAt());
    }


    // DELETE
    @Transactional
    public void deleteComment(Long commentId, Long userId){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));

        // 삭제 권한 체크 로직
        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("자신이 작성한 댓글만 삭제할 수 있습니다.");
        }

        // 부모 댓글이 삭제되어도 대댓글들은 남아있게 하기위해 부모관계를 끊음
        if (comment.getParent() != null) {
            comment.setParent(null); // 부모 댓글을 null로 설정해서 관계를 끊음
        }
        commentRepository.delete(comment);
    };

    // 특정 사용자의 모든 댓글 조회
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByUserId(Long userId) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 댓글 리포지토리에서 userId로 댓글 조회
        List<Comment> comments = commentRepository.findByUserId(userId);

        // DTO로 변환하여 반환
        return comments.stream()
                .map(CommentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
