package com.dd.blog.domain.user.user.dto;

import com.dd.blog.domain.user.user.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;


@Schema(description = "회원 정보 조회 응답 DTO")
@Getter
public class UserInfoResponseDto {

    @Schema(description = "회원 ID", example = "1")
    private final Long userId;

    @Schema(description = "닉네임", example = "blog123")
    private final String nickname;

    @Schema(description = "이메일", example = "blog@naver.com")
    private final String email;

    @Schema(description = "사용자 등급", example = "디톡스새싹")
    private final String roleDisplayName;

    @Schema(description = "가입 시간", example = "2025-04-15T14:20:00")
    private final LocalDateTime createdAt;

    @Builder
    public UserInfoResponseDto(Long userId, String nickname, String email,String roleDisplayName, LocalDateTime createdAt) {
        this.userId = userId;
        this.nickname = nickname;
        this.email = email;
        this.roleDisplayName = roleDisplayName;
        this.createdAt = createdAt;
    }

}
