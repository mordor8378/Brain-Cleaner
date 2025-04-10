package com.dd.blog.domain.user.user.entity;

import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(exclude = "password")
@Table(name = "user")
public class User extends BaseEntity {
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "remaining_point")
    private int remainingPoint;

    @Column(name = "total_point")
    private int totalPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    @Column(name = "social_id")
    private String socialId;

}
