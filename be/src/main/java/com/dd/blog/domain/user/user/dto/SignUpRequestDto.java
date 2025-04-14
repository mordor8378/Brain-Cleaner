package com.dd.blog.domain.user.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpRequestDto {
    @NotBlank(message = "이메일은 필수 입력값입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력값입니다")
    // TODO: @Pattern 패스워드 형식 추가
    private String password;

    @NotBlank(message = "닉네임은 필수 입력값입니다")
    // TODO: @Size 닉네임 길이 제한 추가
    private String nickname;
}
