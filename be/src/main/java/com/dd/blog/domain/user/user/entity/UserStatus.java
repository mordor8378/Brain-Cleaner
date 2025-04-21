package com.dd.blog.domain.user.user.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserStatus {
    ACTIVE("계정활성"), // 활성 상태 (정상)
    SUSPENDED("계정정지"), // 정지 상태
    DELETED("계정삭제"); // 삭제

    private final String statusString;

}