package com.dd.blog.domain.post.postlike.controller;

import com.dd.blog.domain.post.postlike.dto.LikeResponseDto;
import com.dd.blog.domain.post.postlike.service.PostLikeService;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Post Like API", description = "게시글 좋아요/취소 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
public class ApiV1PostLikeController {

    // postLike 로직 처리 Service 객체
    private final PostLikeService postLikeService;

    @Operation(summary = "게시글 좋아요 추가", description = "지정된 게시글에 현재 로그인한 사용자의 좋아요를 추가")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좋아요 처리 성공 or 이미 좋아요 상태)")

    })
    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponseDto> addLike(@PathVariable Long postId, @AuthenticationPrincipal SecurityUser user) {
        LikeResponseDto responseDto = postLikeService.addLike(user.getId(), postId);
        // LikeResponseDto Response = new LikeResponseDto(postId, 1L, true);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "게시글 좋아요 취소", description = "지정된 게시글에 현재 로그인한 사용자의 좋아요를 취소")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "좋아요 취소 성공")
    })
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<LikeResponseDto> removeLike(@PathVariable Long postId, @AuthenticationPrincipal SecurityUser user) {
        postLikeService.deleteLike(user.getId(), postId);
        // LikeResponseDto Response = new LikeResponseDto(postId, 1L, true);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "게시글 좋아요 체크", description = "지정된 게시글에 현재 로그인한 사용자의 좋아요 상태 체크")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좋아요 조회 성공")
    })
    @GetMapping("/{postId}/like/check")
    public ResponseEntity<LikeResponseDto> checkLike(@PathVariable Long postId, @AuthenticationPrincipal SecurityUser user) {
        LikeResponseDto responseDto = postLikeService.checkLike(user.getId(), postId);
        return ResponseEntity.ok(responseDto);
    }
}
