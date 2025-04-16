package com.dd.blog.domain.post.verification.entity;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.global.jpa.BaseEntity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Verification extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 인증 요청한 사용자

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status; // PENDING, APPROVED, REJECTED

    @Column(name = "detox_time", nullable = false)
    private Integer detoxTime;

}

