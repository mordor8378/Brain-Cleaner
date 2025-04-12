package com.dd.blog.domain.post.comment.controller;

import com.dd.blog.domain.post.comment.dto.CommentRequestDto;
import com.dd.blog.domain.post.comment.dto.CommentResponseDto;
import com.dd.blog.domain.post.comment.entity.Comment;
import com.dd.blog.domain.post.comment.service.CommentService;
import com.dd.blog.domain.post.post.dto.PostRequestDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    //특정 게시글의 모든 댓글 조회(대댓글 포함)
    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getAllComments(@PathVariable Long postId){
        List<CommentResponseDto> comments = commentService.getAllComments(postId);
        return ResponseEntity.ok(comments);
    }

    //댓글, 대댓글 작성
    @PostMapping("/{postId}")
    public ResponseEntity<CommentResponseDto> writeComment(@PathVariable Long postId, @Valid @RequestBody CommentRequestDto commentRequestDto){
        CommentResponseDto postComment = commentService.writeComment(postId, commentRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(postComment);
    }

    //댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(@PathVariable Long commentId, @Valid @RequestBody CommentRequestDto commentRequestDto){
        CommentResponseDto updateComment = commentService.updateComment(commentId, commentRequestDto);
        return ResponseEntity.ok(updateComment);
    }

    //댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId){
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }

}