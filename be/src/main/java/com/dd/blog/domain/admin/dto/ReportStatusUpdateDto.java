package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.report.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "신고 상태 변경 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
public class ReportStatusUpdateDto {

    @Schema(description = "변경할 신고 상태", example = "APPROVED", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    private ReportStatus reportStatus;
}
