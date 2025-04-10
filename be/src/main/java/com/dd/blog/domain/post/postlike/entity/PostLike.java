package com.dd.blog.domain.post.postlike.entity;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
@ToString
@Table(
        name = "post_like",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "post_like_uk",
                        columnNames = {"post_id", "user_id"}
                )
        }
)
public class PostLike extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
