package com.dd.blog.domain.post.category.entity;

import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
@Table(name="post")
public class Post extends BaseEntity {
    //기본키
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long post_id;

    //외래키
    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @Column(name = "title", nullable = false, length=100)
    private String title;

    @Column(name = "content", nullable = false, length=200)
    private String content;

    @Column(name = "image_url", nullable = false, length=100)
    private String imageUrl;

    @Column(name="view_count")
    private int viewCount;

    @Column(name="like_count")
    private int likeCount;
}
