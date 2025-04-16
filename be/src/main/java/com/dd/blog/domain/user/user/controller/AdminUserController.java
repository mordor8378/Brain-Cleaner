package com.dd.blog.domain.user.user.controller;

import com.dd.blog.domain.user.user.dto.UserInfoResponseDto;
import com.dd.blog.domain.user.user.service.AdminUserService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "AdminUser API", description = "관리자용 회원 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PreAuthorize("hasRole('ADMIN')") // USER_ADMIN 역할만 호출 가능
    @Operation(summary = "관리자용 사용자 목록 조회", description = "모든 사용자의 정보를 페이징하여 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping
    public ResponseEntity<Page<UserInfoResponseDto>> getUserList(
            @PageableDefault(size = 10, sort = "createdAt, desc")
            @Parameter(hidden = true)
            Pageable pageable) {

        Page<UserInfoResponseDto> userPage = adminUserService.findUser(pageable);
        return ResponseEntity.ok(userPage);
    }

}
