package com.dd.blog.domain.post.postlike.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(description = "좋아요 처리 결과 응답 DTO")
@Getter
@RequiredArgsConstructor
public class LikeResponseDto {

    @Schema(description = "좋아요 처리된 게시글 ID", example = "111")
    private final Long postId;

    @Schema(description = "해당 게시글의 현재 총 좋아요 수", example = "5")
    private final Long likeCount;

    @Schema(description = "현재 사용자의 좋아요 여부", example = "true")
    private final boolean likedByCurrentUser;
}
