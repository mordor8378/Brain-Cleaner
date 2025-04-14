package com.dd.blog.domain.post.category.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponseDto {
    private Long id;
    private String categoryName;
}
