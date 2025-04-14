package com.dd.blog.domain.post.verification.service;

import com.dd.blog.domain.post.verification.dto.VerificationRequestDto;
import com.dd.blog.domain.post.verification.dto.VerificationResponseDto;
import org.springframework.transaction.annotation.Transactional;

public abstract class VerificationService {

    @Transactional
    public abstract VerificationResponseDto createVerification(VerificationRequestDto requestDto);

    @Transactional(readOnly = true)
    public abstract VerificationResponseDto getVerification(Long id);
}
