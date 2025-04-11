package com.dd.blog.domain.post.category.repository;

import com.dd.blog.domain.post.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 카테고리 이름으로 찾아오는 메서드
    Category findByCategoryName(String categoryName);
}
