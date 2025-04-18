package com.dd.blog.domain.post.post.entity;

import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
@Table(name="post")
public class Post extends BaseEntity {
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

    // 인증게시판 전용
    @Column(name = "verification_image_url", length = 255)
    private String verificationImageUrl;

    @Column(name = "detox_time")
    private Integer detoxTime;

    public void update(String title, String content, String imageUrl) {
        // 일부만 수정하므로 null값은 수정하지 않도록 처리
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (imageUrl != null) this.imageUrl = imageUrl;
    }
}
