package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.admin.dto.AdminDashboardStatsDto;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final VerificationRepository verificationRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        // 오늘 날짜범위 계산
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        // 각 통계 계산
        long totalUsers = userRepository.count();
        long pendingVerifications = verificationRepository.countByStatus(VerificationStatus.PENDING); // 리포지토리 메소드 필요!
        long verificationsProcessedToday = verificationRepository.countByStatusInAndUpdatedAtBetween(
                List.of(VerificationStatus.APPROVED, VerificationStatus.REJECTED), // 처리된 상태 목록
                startOfDay,
                endOfDay
        );

        long usersJoinedToday = userRepository.countByCreatedAtBetween(startOfDay, endOfDay); // 리포지토리 메소드 필요!
        long postsCreatedToday = postRepository.countByCreatedAtBetween(startOfDay, endOfDay); // 리포지토리 메소드 필요!
        long totalPosts = postRepository.count();

        return AdminDashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .pendingVerifications(pendingVerifications)
                .verificationsProcessedToday(verificationsProcessedToday)
                .usersJoinedToday(usersJoinedToday)
                .postsCreatedToday(postsCreatedToday)
                .totalPosts(totalPosts)
                .build();

    }


}
