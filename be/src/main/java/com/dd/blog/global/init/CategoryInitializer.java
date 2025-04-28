package com.dd.blog.global.init;

import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        saveIfNotExist("인증게시판");
        saveIfNotExist("정보공유게시판");
        saveIfNotExist("자유게시판");
        saveIfNotExist("공지사항");// 필요하면 추가
    }

    private void saveIfNotExist(String name) {
        if (categoryRepository.findByCategoryName(name) == null) {
            Category category = new Category();
            category.setCategoryName(name);
            categoryRepository.save(category);
        }
    }
}
