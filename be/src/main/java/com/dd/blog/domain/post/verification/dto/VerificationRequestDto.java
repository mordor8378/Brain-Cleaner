package com.dd.blog.domain.post.verification.dto;

import lombok.Getter;

@Getter
public class VerificationRequestDto {
    private Long postId;
    private Long userId;
    private int detoxTime; // 추가된 필드
}
