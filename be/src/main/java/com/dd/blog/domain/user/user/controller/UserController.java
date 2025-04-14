package com.dd.blog.domain.user.user.controller;

import com.dd.blog.domain.user.user.dto.LoginRequestDto;
import com.dd.blog.domain.user.user.dto.SignUpRequestDto;
import com.dd.blog.domain.user.user.dto.TokenResponseDto;
import com.dd.blog.domain.user.user.dto.UserResponseDto;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.service.UserService;
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
    public ResponseEntity<UserResponseDto> signup(@Valid @RequestBody SignUpRequestDto request) {
        User user = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        TokenResponseDto response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserProfile(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refreshToken(@RequestParam String refreshToken) {
        TokenResponseDto response = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
