package com.dd.blog.domain.post.verification.dto;

import com.dd.blog.domain.post.verification.entity.VerificationStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerificationRequestDto {
    // 인증 요청 게시글 ID, 사용자 ID
    private Long postId;
    private Long userId;

    // 인증상태, 디톡스 시간
    private int detoxTime;
    private VerificationStatus status;
}
