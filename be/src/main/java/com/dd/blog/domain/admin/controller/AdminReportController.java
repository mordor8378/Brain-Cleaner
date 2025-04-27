package com.dd.blog.domain.admin.controller;


import com.dd.blog.domain.admin.dto.AdminReportDto;
import com.dd.blog.domain.admin.dto.ReportStatusUpdateDto;
import com.dd.blog.domain.admin.service.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Report API", description = "관리자용 신고 관리 API")
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @Operation(summary = "관리자용 신고 대기 목록 조회", description = "신고된 게시글을 신고 사유와 함께 오름차순으로 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "신고 게시글 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @GetMapping
    public ResponseEntity<Page<AdminReportDto>> getPendingReports(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        Page<AdminReportDto> reportPage = adminReportService.getPendingReports(pageable);
        return ResponseEntity.ok(reportPage); // 성공 시 200 OK 상태와 함께 데이터 반환
    }


    @Operation(summary = "신고 상태 변경", description = "관리자가 신고 상태를 변경 (APPROVED 또는 REJECTED)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "상태 변경 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)"),
    })
    @PatchMapping("/{reportId}/status")
    public ResponseEntity<Void> updateReportStatus(
            @PathVariable Long reportId,
            @Valid @RequestBody ReportStatusUpdateDto requestDto
            ) {
        adminReportService.updateReportStatus(reportId, requestDto.getReportStatus());
        return ResponseEntity.noContent().build();
    }
}
