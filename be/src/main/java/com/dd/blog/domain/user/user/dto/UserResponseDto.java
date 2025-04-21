package com.dd.blog.domain.user.user.dto;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;

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
    private String statusMessage;
    private String detoxGoal;
    private LocalDate birthDate;
    private String profileImageUrl;

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
                .statusMessage(user.getStatusMessage())
                .detoxGoal(user.getDetoxGoal())
                .birthDate(user.getBirthDate())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
