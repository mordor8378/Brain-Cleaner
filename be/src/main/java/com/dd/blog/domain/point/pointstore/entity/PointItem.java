package com.dd.blog.domain.point.pointstore.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PointItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 아이템 이름
    private String name;

    // 아이템 설명 (fe에 노출될 설명글)
    private String description;

    // 구매가(포인트 단위)
    private int price;

    // 아이템 미리보기용
    private String imageUrl;


    // 이모지 치환용 코드 (예: ":zeus:")
    // 이모티콘 코드
    private String code;
}
