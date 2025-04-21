package com.dd.blog.domain.user.user.controller;

import com.dd.blog.domain.user.user.dto.*;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.service.UserService;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import com.dd.blog.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class ApiV1UserController {
    private final UserService userService;
    private final Rq rq;

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    public ResponseEntity<UserResponseDto> signup(@Valid @RequestBody SignUpRequestDto request) {
        User user = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    public ResponseEntity<UserResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            UserResponseDto response = userService.login(request);
            User user = userService.getUserById(response.getId());
            rq.makeAuthCookies(user);
            return ResponseEntity.ok(response);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "사용자의 리프레시 토큰을 무효화하고 로그아웃합니다.")
    public ResponseEntity<String> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {

        System.out.println(authHeader);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            userService.logout(accessToken);
        }

        deleteCookie(response, "accessToken");
        deleteCookie(response, "refreshToken");
        deleteCookie(response, "JSESSIONID");

        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    private void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true); // 원래 쿠키 설정과 맞춰줘야 함
        cookie.setSecure(true);   // HTTPS 사용하는 경우 필요
        cookie.setMaxAge(0);      // 0으로 설정하면 즉시 만료
        response.addCookie(cookie);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "사용자 정보 조회", description = "다른 사용자의 정보를 조회합니다.")
    public ResponseEntity<UserResponseDto> getUserProfile(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

//    @GetMapping("/me")
//    @Operation(summary = "로그인한 사용자 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
//    public ResponseEntity<UserResponseDto> getMyProfile() {
//        User user = rq.getActor();
//        if (user == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//        // 전체 사용자 정보 가져오기
//        user = userService.getUserById(user.getId());
//        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
//    }

    @GetMapping("/me")
    @Operation(summary = "로그인한 사용자 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    public ResponseEntity<UserResponseDto> getMyProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = null;

        // 헤더에서 토큰 추출
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            user = userService.getUserFromAccessToken(accessToken);
        } else {
            // 쿠키에서 토큰 확인 (Rq 객체를 통해)
            user = rq.getActor();
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 토큰에는 기본 정보만 있으므로, 전체 사용자 정보 조회
        User fullUser = userService.getUserById(user.getId());
        return ResponseEntity.ok(UserResponseDto.fromEntity(fullUser));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "계정 삭제", description = "프로필의 계정삭제 버튼을 누르면 사용자 정보를 삭제합니다.")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId){
        userService.deleteUser(userId);
        return ResponseEntity.ok("탈퇴완료");
    }

    @PutMapping("/{userId}")
    @Operation(summary = "프로필 수정", description = "사용자의 프로필 정보를 수정합니다.")
    public ResponseEntity<UserResponseDto> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequestDto request) {
        UserResponseDto updatedUser = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/password")
    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
    public ResponseEntity<Map<String, String>> updatePassword(
            @PathVariable Long userId,
            @Valid @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "새 비밀번호를 입력해주세요."));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "비밀번호는 6자 이상이어야 합니다."));
        }
        try {
            userService.updatePassword(userId, newPassword);
            return ResponseEntity.ok()
                .body(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "비밀번호 변경에 실패했습니다: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
    public ResponseEntity<TokenResponseDto> refreshToken(@RequestParam String refreshToken) {
        TokenResponseDto response = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
