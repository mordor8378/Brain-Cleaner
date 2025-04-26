package com.dd.blog.domain.point.pointstore.dto;

import lombok.Getter;

/**
 * - 유저가 구매하고자 하는 아이템 ID만 전달
 */
@Getter
public class PointItemPurchaseRequestDto {
    private Long itemId;
}
