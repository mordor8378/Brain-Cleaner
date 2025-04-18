package com.dd.blog.domain.admin.controller;

// import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.UserInfoResponseDto;
import com.dd.blog.domain.admin.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "AdminUser API", description = "관리자용 회원 관리 API")
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "관리자용 사용자 목록 조회", description = "모든 사용자의 정보를 페이징하여 조회")
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
            Pageable pageable) {

        Page<UserInfoResponseDto> userPage = adminUserService.findUser(pageable);
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



}
