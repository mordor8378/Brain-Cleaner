package com.dd.blog.domain.admin.controller;

// import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.AdminUserRoleUpdateRequestDto;
import com.dd.blog.domain.admin.dto.AdminUserStatusUpdateRequestDto;
import com.dd.blog.domain.admin.dto.UserInfoResponseDto;
import com.dd.blog.domain.admin.service.AdminUserService;
import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.point.service.PointHistoryService;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AdminUser API", description = "관리자용 회원 관리 API")
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final PointHistoryService pointHistoryService;

    @Operation(summary = "관리자용 사용자 목록 조회", description = "조건에 해당하는 모든 사용자의 정보를 페이징하여 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = UserInfoResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @GetMapping
    public ResponseEntity<Page<UserInfoResponseDto>> getUserList(
            @PageableDefault(size = 10, sort = "createdAt, desc")
            @Parameter(hidden = true)
            Pageable pageable,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status) {

        Page<UserInfoResponseDto> userPage = adminUserService.getUser(pageable, nickname, email, role, status);
        return ResponseEntity.ok(userPage);
    }

    @Operation(summary = "관리자용 사용자 상세 프로필 조회", description = "특정 사용자의 정보를 상세 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = AdminUserDetailResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserDetailResponseDto> getUserDetail(@PathVariable Long userId) {
        AdminUserDetailResponseDto userDetail = adminUserService.getUserDetail(userId);
        return ResponseEntity.ok(userDetail);
    }

    @Operation(summary = "관리자용 특정 사용자 포인트 내역 조회", description = "관리자가 특정 사용자의 포인트 내역을 페이징하여 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)"),
            @ApiResponse(responseCode = "404", description = "해당 사용자를 찾을 수 없음")
    })
    @GetMapping("/{userId}/point-history")
    public ResponseEntity<Page<PointHistoryResponseDto>> getUserPointHistoryForAdmin(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt, desc")
            @Parameter(hidden = true)
            Pageable pageable) {

        Page<PointHistoryResponseDto> historyPage = pointHistoryService.getUserPointHistory(userId, pageable);



        return ResponseEntity.ok(historyPage);
    }





    @Operation(summary = "관리자용 사용자 상태 (Status) 변경", description = "특정 사용자의 상태를 변경")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변경 성공",
                    content = @Content(schema = @Schema(implementation = AdminUserStatusUpdateRequestDto.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @PutMapping("/{userId}/status")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody @Valid AdminUserStatusUpdateRequestDto requestDto,
            @AuthenticationPrincipal SecurityUser currentAdmin) {
        adminUserService.updateUserStatus(userId, requestDto.getNewStatus(), currentAdmin.getId());

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "관리자용 사용자 등급 (Role) 변경", description = "특정 사용자의 등급을 변경")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "변경 성공",
                    content = @Content(schema = @Schema(implementation = AdminUserRoleUpdateRequestDto.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한이 없는 사용자 (관리자 아님)")
    })
    @PutMapping("/{userId}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid AdminUserRoleUpdateRequestDto requestDto) {

        adminUserService.updateUserRole(userId, requestDto.getNewRole());

        return ResponseEntity.ok().build();
    }





}
