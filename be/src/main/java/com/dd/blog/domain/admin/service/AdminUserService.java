package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.UserInfoResponseDto;
import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.point.service.PointHistoryService;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

// 관리자의 사용자 관련 로직 처리
@Service
@RequiredArgsConstructor
public class AdminUserService { //

    private final UserRepository userRepository;
    private final PointHistoryService pointHistoryService;

    // 관리자용 : 특정 조건에 맞는 모든 사용자 목록 페이징 조회
    @Transactional(readOnly = true)
    public Page<UserInfoResponseDto> getUser(Pageable pageable, String nickname, String email, UserRole role, UserStatus status) {

        Specification<User> spec = Specification.where(null);


            spec = spec.and(UserSpecifications.nicknameContains(nickname))
                    .and(UserSpecifications.emailContains(email))
                    .and(UserSpecifications.roleEquals(role))
                    .and(UserSpecifications.statusEquals(status));


        Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.map(this::userToDto);
    }

    // 관리자용 : 사용자의 세부 프로필 조회
    public AdminUserDetailResponseDto getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id: " + userId));

        Pageable recentHistoryPageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "id"));
        Page<PointHistoryResponseDto> pointHistoryPage = pointHistoryService.getUserPointHistory(userId, recentHistoryPageable);

        return AdminUserDetailResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .ssoProvider(user.getSsoProvider())
                .remainingPoint(user.getRemainingPoint())
                .totalPoint(user.getTotalPoint())
                .pointHistoryPage(pointHistoryPage)
                .build();
    }

    // 관리자용 : 사용자의 상태 (Status) 변경
    @Transactional
    public void updateUserStatus(Long userId, UserStatus newStatus, Long currentAdminId) {

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if(targetUser.getRole() == UserRole.ROLE_ADMIN &&
                (newStatus == UserStatus.SUSPENDED || newStatus == UserStatus.DELETED)) {
            throw new ApiException(ErrorCode.CANNOT_CHANGE_ADMIN_STATUS);
        }

        // 상태 변경 적용
        targetUser.setStatus(newStatus);

        if(newStatus == UserStatus.SUSPENDED) {
            targetUser.updateRefreshToken(null);
        } else if(newStatus == UserStatus.DELETED) {
            // 회원 삭제 시, Soft Delete 방식 적용
            targetUser.setNickname("탈퇴한 회원_" + targetUser.getNickname());
            targetUser.setEmail("deleted_" + targetUser.getEmail());
            targetUser.setPassword(null);
            targetUser.setRefreshToken(null);
            // 팔로우 관계 끊기 등 추후 적용 검토
        }

        userRepository.save(targetUser);

    }

    @Transactional
    public void updateUserRole(Long userId, UserRole newRole) {

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if(targetUser.getRole() == UserRole.ROLE_ADMIN) {
            throw new ApiException(ErrorCode.CANNOT_ChANGE_ADMIN_ROLE);
        }

        targetUser.setRole(newRole);

        userRepository.save(targetUser);
    }

    // User 엔티티를 UserInfoResponseDto로 변환
    private UserInfoResponseDto userToDto(User user) {
        return UserInfoResponseDto.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .role(user.getRole().getRoleString())
                .status(user.getStatus().getStatusString())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
