package com.dd.blog.domain.user.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequestDto {
    @NotBlank(message = "닉네임은 필수 입력값입니다")
    private String nickname;
    private String email;
    private String statusMessage;
    private String detoxGoal;
    private LocalDate birthDate;
    private String profileImageUrl;
} 