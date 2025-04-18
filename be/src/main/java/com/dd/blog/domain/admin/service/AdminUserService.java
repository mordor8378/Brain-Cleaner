package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.admin.dto.AdminUserDetailResponseDto;
import com.dd.blog.domain.admin.dto.UserInfoResponseDto;
import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.point.service.PointHistoryService;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PointHistoryService pointHistoryService;

    // 관리자용 : 모든 사용자 목록 페이징 조회
    @Transactional(readOnly = true)
    public Page<UserInfoResponseDto> findUser(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserInfoResponseDto> dtos = userPage.getContent().stream()
                .map(this::userToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
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
                .status(user.getUserStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .ssoProvider(user.getSsoProvider())
                .remainingPoint(user.getRemainingPoint())
                .totalPoint(user.getTotalPoint())
                .pointHistoryPage(pointHistoryPage)
                .build();
    }

    // User 엔티티를 UserInfoResponseDto로 변환
    private UserInfoResponseDto userToDto(User user) {
        return UserInfoResponseDto.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .roleDisplayName(user.getRole().getDisplayName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
