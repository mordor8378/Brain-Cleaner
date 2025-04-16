package com.dd.blog.domain.user.user.service;

import com.dd.blog.domain.user.user.dto.UserInfoResponseDto;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    // 관리자용 : 모든 사용자 목록 페이징 조회
    @Transactional(readOnly = true)
    public Page<UserInfoResponseDto> findUser(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserInfoResponseDto> dtos = userPage.getContent().stream()
                .map(this::userToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
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
