package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.user.user.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "회원 등급 변경 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
public class AdminUserRoleUpdateRequestDto {

    @Schema(description = "새로운 회원 등급", example = "ROLE_USER_TRAINEE")
    @NotNull(message = "새로운 등급을 반드시 지정해주세요.")
    private UserRole newRole;
}
