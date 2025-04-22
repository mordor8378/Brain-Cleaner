package com.dd.blog.domain.post.category.service;

import com.dd.blog.domain.post.category.dto.CategoryResponseDto;
import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> CategoryResponseDto.builder()
                        .id(category.getId())
                        .categoryName(category.getCategoryName())
                        .build())
                .collect(Collectors.toList());
    }
}
