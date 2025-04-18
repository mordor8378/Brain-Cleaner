package com.dd.blog.domain.point.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "포인트 내역 응답 DTO")
@Getter
@Builder
public class PointHistoryResponseDto {

    @Schema(description = "포인트 내역 ID", example = "10")
    private final Long historyId;

    @Schema(description = "포인트 변화량 +,- 값", example = "+10")
    private final Integer pointChange;

    @Schema(description = "변경 사유 ('증가' 혹은 '감소')", example = "증가")
    private final String type;

    @Schema(description = "변경 발생 시간", example = "2025-04-12T05:30:00")
    private final LocalDateTime createdAt;

}
