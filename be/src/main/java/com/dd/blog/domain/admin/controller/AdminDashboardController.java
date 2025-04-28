package com.dd.blog.domain.admin.controller;

import com.dd.blog.domain.admin.dto.AdminDashboardStatsDto;
import com.dd.blog.domain.admin.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "AdminDashboard API", description = "관리자용 메인 페이지용 주요 통계 API")
public class AdminDashboardController {

        private final AdminDashboardService adminDashboardService;


        @Operation(summary = "관리자용 대시보드 통계 조회", description = "대시보드에 표시될 주요 통계 정보(총 회원 수, 대기 중인 인증 수 등)를 조회")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "204", description = "통계 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        System.out.println(">>> HIT /api/admin/dashboard/stats Controller Method!");

        AdminDashboardStatsDto statsDto = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(statsDto);
    }

}
