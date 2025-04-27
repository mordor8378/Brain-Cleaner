package com.dd.blog.domain.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "게시글 신고 생성 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
public class ReportCreateRequestDto {

    @Schema(description = "신고할 게시글 IO", example = "123")
    @NotNull(message = "신고할 게시글 ID는 필수입니다.")
    private Long postId;

    @Schema(description = "신고 사유 (5자 이상 1000자 이하)", example = "이 게시글을 부적절한 내용을 포함하고 있습니다.")
    @NotBlank(message = "신고 사유는 필수입니다.")
    @Size(min = 5, max = 1000, message ="신고 사유는 5자이상 1000자 이하")
    private String reason;


}
