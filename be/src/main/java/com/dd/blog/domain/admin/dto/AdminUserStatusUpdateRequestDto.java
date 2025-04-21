package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.user.user.entity.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "회원 상태 변경 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
public class AdminUserStatusUpdateRequestDto {

    @Schema(description = "새로운 회원 상태", example = "SUSPENDED")
    @NotNull(message = "새로운 상태를 반드시 지정해주세요.")
    private UserStatus newStatus; // ACTIVE, SUSPENDED, DELETED

}
