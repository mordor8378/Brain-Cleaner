package com.dd.blog.domain.user.user.service;

import com.dd.blog.domain.user.user.dto.LoginRequestDto;
import com.dd.blog.domain.user.user.dto.SignUpRequestDto;
import com.dd.blog.domain.user.user.dto.TokenResponseDto;
import com.dd.blog.domain.user.user.entity.User;

// TODO: 나중에 클래스로 바꾸고 구현
public interface UserService {
    User signup(SignUpRequestDto request);
    TokenResponseDto login(LoginRequestDto request);
    User getUserById(Long userId);
    TokenResponseDto refreshToken(String refreshToken);
}
