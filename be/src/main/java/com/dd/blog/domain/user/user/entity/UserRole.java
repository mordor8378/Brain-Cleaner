package com.dd.blog.domain.user.user.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {

    ROLE_USER_SPROUT("디톡스새싹"),
    ROLE_USER_TRAINEE("절제수련생"),
    ROLE_USER_EXPLORER("집중탐험가"),
    ROLE_USER_CONSCIOUS("선명한의식"),
    ROLE_USER_DESTROYER("도파민파괴자"),
    ROLE_USER_CLEANER("브레인클리너"),

    ROLE_ADMIN("관리자");

    private final String displayName;

}