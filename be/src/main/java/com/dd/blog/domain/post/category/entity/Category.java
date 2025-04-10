package com.dd.blog.domain.post.category.entity;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name="category")
@Getter
@Setter
@NoArgsConstructor
// 카테고리 3개라 필요 없음
// @Builder
public class Category extends BaseEntity {

//        @Id
//        @GeneratedValue(strategy = GenerationType.IDENTITY)
//        @Column(name = "category_id")
//        private Long categoryId;

    @Column(name = "category_name", nullable = false)
    private String categoryName; // 인증게시판, 자유게시판, 정보공유게시판

    @OneToMany(mappedBy = "category")
    private List<Post> posts;
}
