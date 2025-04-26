package com.dd.blog.domain.post.category.controller;

import com.dd.blog.domain.post.category.dto.CategoryResponseDto;
import com.dd.blog.domain.post.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Category", description = "게시판 카테고리 관련 API")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class ApiV1CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "전체 카테고리 조회", description = "게시판 분류(예: 인증, 자유, 정보공유)를 모두 조회합니다.")
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {

        return ResponseEntity.ok(categoryService.getAllCategories());
    }

}