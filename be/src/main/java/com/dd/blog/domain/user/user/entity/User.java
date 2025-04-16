package com.dd.blog.domain.user.user.entity;

//import com.dd.blog.domain.point.entity.PointHistory;
//import com.dd.blog.domain.post.comment.entity.Comment;
//import com.dd.blog.domain.post.post.entity.Post;
//import com.dd.blog.domain.post.postlike.entity.PostLike;
import com.dd.blog.global.jpa.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(exclude = "password")
@Table(name = "users")
public class User extends BaseEntity {
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @JsonIgnore
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

    @Column(name = "refresh_token", unique = true)
    private String refreshToken;

    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    @Column(name = "social_id")
    private String socialId;

//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Post> posts = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<Comment> comments = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<PostLike> likes = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
//    private List<PointHistory> pointHistories = new ArrayList<>();

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public boolean isAdmin() {
        return UserRole.ROLE_ADMIN.equals(this.role);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // 기본 사용자 권한
        authorities.add(new SimpleGrantedAuthority(this.role.toString()));

        // 관리자인 경우 추가 권한
        if (isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return authorities;
    }

    // 소셜 로그인 정보 업데이트
    public void updateSocialInfo(String ssoProvider, String socialId) {
        this.ssoProvider = ssoProvider;
        this.socialId = socialId;
    }
}
