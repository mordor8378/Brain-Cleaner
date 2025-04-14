package com.dd.blog.domain.user.user.controller;

import com.dd.blog.domain.user.user.dto.LoginRequestDto;
import com.dd.blog.domain.user.user.dto.SignUpRequestDto;
import com.dd.blog.domain.user.user.dto.TokenResponseDto;
import com.dd.blog.domain.user.user.dto.UserResponseDto;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    public ResponseEntity<UserResponseDto> signup(@Valid @RequestBody SignUpRequestDto request) {
        User user = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        TokenResponseDto response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "사용자 정보 조회", description = "특정 사용자의 정보를 조회합니다.")
    public ResponseEntity<UserResponseDto> getUserProfile(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
    public ResponseEntity<TokenResponseDto> refreshToken(@RequestParam String refreshToken) {
        TokenResponseDto response = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
