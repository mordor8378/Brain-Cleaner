package com.dd.blog.domain.post.verification.controller;


import com.dd.blog.domain.post.verification.dto.VerificationRequestDto;
import com.dd.blog.domain.post.verification.dto.VerificationResponseDto;
import com.dd.blog.domain.post.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/verifications")
@RequiredArgsConstructor
@Tag(name = "Verification", description = "인증 게시판 관련 API")
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping
    @Operation(summary = "인증글 등록", description = "디톡스 인증글을 등록합니다.")
    public ResponseEntity<VerificationResponseDto> createVerification(@RequestBody VerificationRequestDto requestDto) {
        return ResponseEntity.ok(verificationService.createVerification(requestDto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "인증글 조회", description = "특정 인증글을 ID로 조회합니다.")
    public ResponseEntity<VerificationResponseDto> getVerification(@PathVariable Long id) {
        return ResponseEntity.ok(verificationService.getVerification(id));
    }
}
