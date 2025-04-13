package com.dd.blog.domain.post.verification.dto;

import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VerificationResponseDto {
    private Long verificationId;
    private Long postId;
    private Long userId;
    private VerificationStatus status;
    private int detoxTime;
}
