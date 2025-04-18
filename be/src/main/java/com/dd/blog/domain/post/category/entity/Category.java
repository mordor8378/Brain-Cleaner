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
public class Category extends BaseEntity {
    @Column(name = "category_name", nullable = false)
    private String categoryName; // 인증게시판, 자유게시판, 정보공유게시판

    @OneToMany(mappedBy = "category")
    private List<Post> posts;

}
