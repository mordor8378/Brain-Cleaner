package com.dd.blog.domain.post.post.entity;

import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.postlike.entity.PostLike;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.post.comment.entity.Comment;
import com.dd.blog.global.jpa.BaseEntity;
import com.dd.blog.global.json.StringArrayConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList; // for 댓글 list
import java.util.List;

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

    @Column(name = "image_url", length=500)
    @Convert(converter = StringArrayConverter.class)
    private String[] imageUrl;

    // 인기게시글 TOP5 위해 다시 추가
    @Column(name = "view_count")
    private int viewCount;

    @Column(name="like_count")
    private int likeCount;

    // 인증게시판 전용
    @Column(name = "verification_image_url", length = 255)
    private String verificationImageUrl;

    @Column(name = "detox_time")
    private Integer detoxTime;

    // 게시글 - 댓글 관계 JPA 상에서 연결
    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> postLikes = new ArrayList<>();

    // 게시글 수정 메서드
    public void update(String title, String content, String[] imageUrl) {
        // 일부만 수정하므로 null값은 수정하지 않도록 처리
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (imageUrl != null) this.imageUrl = imageUrl;
    }

    // 좋아요 메서드
    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    // viewCount 메서드
    public void increaseViewCount() {
        this.viewCount++;
    }

}
