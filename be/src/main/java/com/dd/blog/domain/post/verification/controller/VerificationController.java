package com.dd.blog.domain.post.verification.controller;


import com.dd.blog.domain.post.verification.dto.VerificationRequestDto;
import com.dd.blog.domain.post.verification.dto.VerificationResponseDto;
import com.dd.blog.domain.post.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    @Operation(
            summary = "인증글 작성",
            description = "인증 게시판에 디톡스 인증글을 등록합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "인증글 등록 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "500", description = "서버 오류")
            }
    )
    public ResponseEntity<VerificationResponseDto> createVerification(@RequestBody VerificationRequestDto requestDto) {
        return ResponseEntity.ok(verificationService.createVerification(requestDto));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "인증글 상세 조회",
            description = "인증 게시판에 등록된 인증글을 ID로 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 인증글 없음")
            }
    )
    public ResponseEntity<VerificationResponseDto> getVerification(@PathVariable Long id) {
        return ResponseEntity.ok(verificationService.getVerification(id));
    }
}
