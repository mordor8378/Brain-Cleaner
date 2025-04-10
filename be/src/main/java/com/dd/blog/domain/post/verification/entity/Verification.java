package com.dd.blog.domain.post.verification.entity;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.post.category.entity.Post;
import com.dd.blog.global.jpa.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification extends BaseEntity {

//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "verification_id")
//    private Long verificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 인증 요청한 사용자

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status; // PENDING, APPROVED, REJECTED

    // @Column(name = "created_at")
    // private LocalDateTime createdAt;

    // @Column(name = "updated_at")
    // private LocalDateTime updatedAt;
}

