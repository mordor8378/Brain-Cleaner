package com.dd.blog.domain.point.controller;

import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.point.service.PointHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@Tag(name = "Point History API", description = "사용자 포인트 내역 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/points")
public class ApiV1PointHistoryController {

    private final PointHistoryService pointHistoryService;

    @Operation(summary = "내 포인트 내역 조회", description = "현재 로그인한 사용자의 포인트 적립/사용 내역을 페이징하여 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "포인트 내역 조회 성공",
            content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/history")
    public ResponseEntity<Page<PointHistoryResponseDto>> getMyPointHistory(
            @PageableDefault(size = 10, sort = "createdAt, desc")
            @Parameter(hidden = true)
            Pageable pageable) {


        // 임시 ID 사용
        Long currentUserId= 1L;

        Page<PointHistoryResponseDto> historyPage = pointHistoryService.getUserPointHistory(currentUserId, pageable);

        // 서비스 구현 안되어있으므로 일단 임시생성해서 반환
        Page<PointHistoryResponseDto> emptyPage = new PageImpl<>(new ArrayList<>());
        return ResponseEntity.ok(emptyPage);
    }

}
