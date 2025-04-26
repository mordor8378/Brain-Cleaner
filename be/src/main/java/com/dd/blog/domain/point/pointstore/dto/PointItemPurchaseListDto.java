package com.dd.blog.domain.point.pointstore.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * - 마이페이지에서 내가 어떤 아이템을 샀는지 확인할 때 사용
 */
@Getter
@Builder
public class PointItemPurchaseListDto {
    private Long itemId;
    private String name;  // 아이템 이름
    private String description;  // 아이템 설명
    private int price;  // 구매가격(포인트 단위)
    private String imageUrl; // 아이템 썸네일 이미지 URL

    private String code; // 이모티콘 코드

    private LocalDateTime purchasedAt;  // 구매시각
}
