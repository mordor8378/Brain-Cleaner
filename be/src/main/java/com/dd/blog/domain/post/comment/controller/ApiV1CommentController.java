package com.dd.blog.domain.post.comment.controller;

import com.dd.blog.domain.post.comment.dto.CommentRequestDto;
import com.dd.blog.domain.post.comment.dto.CommentResponseDto;
import com.dd.blog.domain.post.comment.dto.CommentUpdateResponseDto;
import com.dd.blog.domain.post.comment.service.CommentService;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class ApiV1CommentController {

    private final CommentService commentService;


    // READ
    // ALL COMMENTS(특정 게시글, 대댓글 포함)
    @Operation(
            summary = "댓글 전체 조회",
            description = "게시글 ID를 통해 해당 게시글의 댓글 및 대댓글을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getAllComments(@PathVariable Long postId){
        List<CommentResponseDto> comments = commentService.getAllComments(postId);
        return ResponseEntity.ok(comments);
    }


    // CREATE
    // 댓글, 대댓글
    @Operation(
            summary = "댓글 또는 대댓글 작성",
            description = "게시글 ID를 기반으로 댓글 또는 대댓글을 작성합니다.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "작성 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @PostMapping("/{postId}")
    public ResponseEntity<CommentResponseDto> writeComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody CommentRequestDto commentRequestDto){
        CommentResponseDto postComment = commentService.writeComment(postId, commentRequestDto, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(postComment);
    }


    // UPDATE
    // UPDATE COMMENT
    @Operation(
            summary = "댓글 수정",
            description = "댓글 ID를 기반으로 기존 댓글을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "수정 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 댓글 없음")
            }
    )
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentUpdateResponseDto> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal SecurityUser user,
            @RequestBody CommentRequestDto commentRequestDto){
        CommentUpdateResponseDto updatedComment = commentService.updateComment(commentId, commentRequestDto, user.getId());
        return ResponseEntity.ok(updatedComment);
    }


    // DELETE
    // DELETE COMMENT
    @Operation(
            summary = "댓글 삭제",
            description = "댓글 ID를 기반으로 댓글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "삭제 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 댓글 없음")
            }
    )
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal SecurityUser user){
            commentService.deleteComment(commentId, user.getId());
            return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }

}