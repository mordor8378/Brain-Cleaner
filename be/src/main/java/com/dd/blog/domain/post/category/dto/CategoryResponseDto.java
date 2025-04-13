package com.dd.blog.domain.post.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
@Getter
@Builder
@AllArgsConstructor
public class CategoryResponseDto {
    private Long id;
    private String categoryName;
}
