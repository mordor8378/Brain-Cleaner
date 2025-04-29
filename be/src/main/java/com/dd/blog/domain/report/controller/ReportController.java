package com.dd.blog.domain.report.controller;

import com.dd.blog.domain.report.dto.ReportCreateRequestDto;
import com.dd.blog.domain.report.service.ReportService;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Report API", description = "게시글 신고 관련 API")
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "신고 내용 작성", description = "게시글에 대한 신고 내용 작성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "신고 등록 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PostMapping
    public ResponseEntity<Long> createReport(
            @Valid @RequestBody ReportCreateRequestDto request,
            @AuthenticationPrincipal SecurityUser securityUser
            ) {
            if(securityUser == null)
                throw new ApiException(ErrorCode.ACCESS_DENIED);
            Long reporterId = securityUser.getId();
            Long createdReportId = reportService.createReport(request, reporterId);

            return ResponseEntity.status(HttpStatus.CREATED).body(createdReportId);


    }
}
