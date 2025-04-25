package com.dd.blog.domain.point.pointstore.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * - 유저가 어떤 아이템을 샀고, 얼마 남았는지 알려줌
 */
@Getter
@Builder
public class PointItemPurchaseResultDto {
    private String itemName;  // 구매한 아이템 이름
    private int itemPrice;  // 아이템 가격(포인트 단위)
    private int remainingPoint;  // 구매 후 남은 포인트
}
