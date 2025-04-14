package com.dd.blog.domain.user.user.dto;

import com.dd.blog.domain.user.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponseDto {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String nickname;
    private UserRole role;
}
