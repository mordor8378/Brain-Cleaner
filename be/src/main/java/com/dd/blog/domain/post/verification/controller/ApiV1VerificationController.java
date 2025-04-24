package com.dd.blog.domain.post.verification.controller;

import com.dd.blog.domain.post.verification.dto.VerificationRequestDto;
import com.dd.blog.domain.post.verification.dto.VerificationResponseDto;
import com.dd.blog.domain.post.verification.service.VerificationService;

import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/verifications")
@RequiredArgsConstructor
@Tag(name = "Verification", description = "인증 게시판 관련 API")
public class ApiV1VerificationController {

    private final VerificationService verificationService;

    // CREATE
    @PostMapping
    @Operation(summary = "인증글 등록", description = "디톡스 인증글을 등록합니다.")
    public ResponseEntity<VerificationResponseDto> createVerification(@RequestBody VerificationRequestDto requestDto) {
        VerificationResponseDto response = verificationService.createVerification(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // READ
    @GetMapping("/{id}")
    @Operation(summary = "인증글 조회", description = "인증글을 ID로 조회합니다.")
    public ResponseEntity<VerificationResponseDto> getVerification(@PathVariable Long id) {
            VerificationResponseDto response = verificationService.getVerification(id);
            return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly")
    @Operation(summary = "주간 인증 현황 조회", description = "특정 사용자의 이번 주 인증 현황을 조회합니다.")
    public ResponseEntity<List<LocalDate>> getWeeklyVerifications(@AuthenticationPrincipal SecurityUser user) {
        List<LocalDate> weeklyVerifications = verificationService.getWeeklyVerifications(user.getId());
        return ResponseEntity.ok(weeklyVerifications);
    }

    @GetMapping("/streak")
    @Operation(summary = "연속 인증 일수 조회", description = "특정 사용자의 연속 인증 일수를 조회합니다.")
    public ResponseEntity<Integer> getStreakDays(@AuthenticationPrincipal SecurityUser user) {
        int streakDays = verificationService.getStreakDays(user.getId());
        return ResponseEntity.ok(streakDays);
    }

    // READ ALL
    @GetMapping
    @Operation(summary = "인증글 전체 조회")
    public ResponseEntity<List<VerificationResponseDto>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    // UPDATE
    @Operation(summary = "인증 수정", description = "인증 요청을 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<VerificationResponseDto> updateVerification(@PathVariable Long id, @RequestBody VerificationRequestDto requestDto) {
        VerificationResponseDto response = verificationService.updateVerification(id, requestDto);
        return ResponseEntity.ok(response);
    }

    // DELETE
    @Operation(summary = "인증 삭제", description = "인증 요청을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVerification(@PathVariable Long id) {
        verificationService.deleteVerification(id);
        return ResponseEntity.noContent().build();
    }

}
