package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VerificationStatusUpdateDto {

    @NotNull(message = "상태 값 (APPROVED 또는 REJECTED) 지정 필수")
    private VerificationStatus status;
}
