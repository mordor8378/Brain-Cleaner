package com.dd.blog.domain.user.user.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public enum UserRole {

    ROLE_USER_SPROUT("디톡스새싹", 0),
    ROLE_USER_TRAINEE("절제수련생", 100),
    ROLE_USER_EXPLORER("집중탐험가", 600),
    ROLE_USER_CONSCIOUS("선명한의식", 2000),
    ROLE_USER_DESTROYER("도파민파괴자", 4500),
    ROLE_USER_CLEANER("브레인클리너", 7500),

    ROLE_ADMIN("관리자", Long.MAX_VALUE);

    private final String roleString;
    private final long minPoints;

    /** 누적 포인트가 주어지면 해당하는 최고 등급 반환 */
    public static UserRole getRoleForPoints(int totalPoints) {

        for (int i = values().length - 1; i >= 0; i--) {
            UserRole role = values()[i];
            if (role == ROLE_ADMIN) continue;        // 관리자 건너뜀
            if (totalPoints >= role.minPoints) {
                return role;                         // 조건 충족 → 바로 반환
            }
        }
        return ROLE_USER_SPROUT; // 아무것도 못 찾으면 기본 등급
    }

    // 현재 역할이 주어진 역할보다 높은 등급인지 확인
    public boolean isHigherThan(UserRole otherRole) {
        if(this == ROLE_ADMIN || otherRole == ROLE_ADMIN)
            return false;

        return this.minPoints > otherRole.getMinPoints();
    }




}