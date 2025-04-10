package com.dd.blog.domain.user.user.entity;

import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class User extends BaseEntity {
    @Column(name = "email", nullable = false, length = 50)
    private String email;

    @Column(name = "password", length = 50)
    private String password;

    @Column(name = "nickname", nullable = false, length = 15)
    private String nickname;

    @Column(name = "remaining_point")
    private int remainingPoint;

    @Column(name = "total_point")
    private int totalPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    @Column(name = "social_id", length = 255)
    private String socialId;

    public enum Role {
        ROLE_USER, ROLE_ADMIN
    }
}
