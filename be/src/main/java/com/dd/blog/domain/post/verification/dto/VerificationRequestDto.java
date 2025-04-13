package com.dd.blog.domain.post.verification.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VerificationRequestDto {
    private Long postId;
    private Long userId;
    private int detoxTime; // 추가된 필드
}
