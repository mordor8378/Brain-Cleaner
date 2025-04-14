package com.dd.blog.domain.post.category.service;

import com.dd.blog.domain.post.category.dto.CategoryResponseDto;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public abstract class CategoryService {

    @Transactional(readOnly = true)
    public abstract List<CategoryResponseDto> getAllCategories();
}
