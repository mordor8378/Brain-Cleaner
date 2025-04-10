package com.dd.blog.domain.point.entity;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "point_histories")
public class PointHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "point_change", nullable = false)
    private Integer pointChange;

    @Column(nullable = false, length = 30)
    private String type;

    @Builder
    public PointHistory(User user, Integer pointChange, String type) {
        this.user = user;
        this.pointChange = pointChange;
        this.type = type;
    }
}
