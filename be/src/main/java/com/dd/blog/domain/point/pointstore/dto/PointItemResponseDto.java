package com.dd.blog.domain.point.pointstore.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * - 프론트에서 아이템 목록을 진열할 때 사용
 */
@Getter
@Builder
public class PointItemResponseDto {
    private Long id;
    private String name;  // 아이템 이름
    private String description;  // 아이템 설명
    private int price;  // 아이템 가격(포인트 단위)
    private String imageUrl;  // 이미지 URL(아이템 미리보기용)
    private String code;  // 프론트에서 emoji picker와 매핑할 이모지 코드
}
