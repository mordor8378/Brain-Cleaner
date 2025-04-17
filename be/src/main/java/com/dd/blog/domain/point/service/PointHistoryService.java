package com.dd.blog.domain.point.service;

import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import com.dd.blog.domain.point.entity.PointHistory;
import com.dd.blog.domain.point.repository.PointHistoryRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PointHistoryService {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<PointHistoryResponseDto> getUserPointHistory(Long userid, Pageable pageable) {
        User user = userRepository.findById(userid)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id: " + userid));

        Page<PointHistory> historyPage = pointHistoryRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        Page<PointHistoryResponseDto> dtoPage = historyPage.map(this::toDto);

        return dtoPage;
    }

    private PointHistoryResponseDto toDto(PointHistory pointHistory) {

        return PointHistoryResponseDto.builder()
                .historyId(pointHistory.getId())
                .pointChange(pointHistory.getPointChange())
                .type(pointHistory.getType())
                .createdAt(pointHistory.getCreatedAt())
                .build();

    }

}
