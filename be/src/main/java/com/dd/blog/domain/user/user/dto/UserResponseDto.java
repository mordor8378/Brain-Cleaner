package com.dd.blog.domain.user.user.dto;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String email;
    private String nickname;
    private int remainingPoint;
    private int totalPoint;
    private UserRole role;
    private LocalDateTime createdAt;
    private boolean isSocialUser;

    public static UserResponseDto fromEntity(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .remainingPoint(user.getRemainingPoint())
                .totalPoint(user.getTotalPoint())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .isSocialUser(user.getSocialId() != null)
                .build();
    }
}
