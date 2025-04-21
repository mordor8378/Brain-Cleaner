package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserDetailResponseDto {

    // 기본 사용자 정보
    private Long userId;
    private String email;
    private String nickname;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String ssoProvider;

    // 포인트 정보
    private int remainingPoint;
    private int totalPoint;

    // 포인트 내역
    private Page<PointHistoryResponseDto> pointHistoryPage;

}
