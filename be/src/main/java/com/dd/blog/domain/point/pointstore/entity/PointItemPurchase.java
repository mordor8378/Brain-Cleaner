package com.dd.blog.domain.point.pointstore.entity;

import com.dd.blog.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [Entity] PointItemPurchase
 * 포인트 상점 아이템 구매 이력
 * - 유저가 어떤 아이템을 언제 구매했는지 저장
 * - 구매 제한, 이력 조회 등에 사용됨
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PointItemPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 유저는 여러 아이템을 구매할 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 같은 아이템을 여러 유저가 구매할 수 있다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private PointItem item;

    private LocalDateTime purchasedAt;
}
