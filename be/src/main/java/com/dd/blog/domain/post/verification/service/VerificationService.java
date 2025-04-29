package com.dd.blog.domain.post.verification.service;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.domain.post.verification.dto.*;
import com.dd.blog.domain.post.verification.entity.*;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;

import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final VerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    // 인증요청 CREATE 메서드
    @Transactional
    public VerificationResponseDto createVerification(VerificationRequestDto verificationRequestDto) {
        Post post = postRepository.findById(verificationRequestDto.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
                
        User user = userRepository.findById(verificationRequestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

        // 인증 엔티티 생성
        Verification verification = Verification.builder()
                .user(user) // 연관 사용자 설정
                .post(post) // 연관 게시글 설정
                .status(VerificationStatus.PENDING) //default 상태값: PENDING
                .detoxTime(verificationRequestDto.getDetoxTime()) // 디톡스 시간 설정
                .build();

        // 인증 정보 저장
        verificationRepository.save(verification);

        // 연속 인증 일수 업데이트
        updateStreakDays(verificationRequestDto.getUserId());

        // 엔티티 DTO 변환
        return toDto(verification);
    }

    // 인증요청 READ 메서드(via ID)
    @Transactional(readOnly = true)
    public VerificationResponseDto getVerification(Long id) {
        try {
            Verification verification = verificationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("해당 인증 요청이 존재하지 않습니다."));

            return toDto(verification);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "인증 정보를 조회하는 중 오류가 발생했습니다.");
        }
    }

    // 인증요청 전체 READ 메서드
    @Transactional(readOnly = true)
    public List<VerificationResponseDto> getAllVerifications() {
        return verificationRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 인증요청 UPDATE 메서드
    @Transactional
    public VerificationResponseDto updateVerification(Long id, VerificationRequestDto requestDto) {
        try {
            Verification verification = verificationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("인증 요청을 찾을 수 없습니다."));

            verification.setDetoxTime(requestDto.getDetoxTime());
            verification.setStatus(requestDto.getStatus());

            return toDto(verification);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "인증 정보를 수정하는 중 오류가 발생했습니다.");
        }
    }

    // 인증요청 DELETE 메서드
    @Transactional
    public void deleteVerification(Long id) {
        try {
            Verification verification = verificationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("인증 요청을 찾을 수 없습니다."));
            verificationRepository.delete(verification);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "인증 정보를 삭제하는 중 오류가 발생했습니다.");
        }
    }

    // DTO 변환 로직(공통)
    private VerificationResponseDto toDto(Verification verification) {
        if(verification == null) return null;

        User user = verification.getUser();
        Post post = verification.getPost();

        Long userId = (user != null) ? user.getId() : null;
        String userNickname = (user != null) ? user.getNickname() : null;

        Long postId = (post != null) ? post.getId() : null;
        String verificationImageUrl =
                (post != null && post.getVerificationImageUrl() != null)
                        ? post.getVerificationImageUrl()  // String 타입 처리
                        : null;
        return VerificationResponseDto.builder()
                .verificationId(verification.getId())
                .userId(userId)
                .postId(postId)
                .status(verification.getStatus())
                .detoxTime(verification.getDetoxTime())
                .userNickname(userNickname)
                .verificationImageUrl(verificationImageUrl)
                .createdAt(verification.getCreatedAt())
                .build();
    }

    // 주간 인증 현황
    @Transactional(readOnly = true)
    public List<LocalDate> getWeeklyVerifications(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // PENDING 또는 APPROVED 상태인 인증만 조회
        List<VerificationStatus> validStatuses = Arrays.asList(VerificationStatus.PENDING, VerificationStatus.APPROVED);

        // 해당 사용자의 이번 주 유효한 인증 날짜들을 조회
        return verificationRepository.findByUserIdAndCreatedAtBetweenAndStatusIn(
                userId,
                startOfWeek.atStartOfDay(),
                endOfWeek.atTime(23, 59, 59),
                validStatuses)
                .stream()
                .map(verification -> verification.getCreatedAt().toLocalDate())
                .distinct() // 같은 날 여러 번 인증한 경우 중복 제거
                .collect(Collectors.toList());
    }

    // 인증 스트릭
    @Transactional
    public int getStreakDays(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return user.getStreakDays();
    }

    // 인증 생성시 연속 인증 업데이트
    @Transactional
    public void updateStreakDays(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now();
        LocalDate lastVerificationDate = user.getLastVerificationDate();

        if (lastVerificationDate == null) {
            // 첫 인증인 경우
            user.setStreakDays(1);
        } else if (lastVerificationDate.equals(today.minusDays(1))) {
            // 어제 인증했다면 연속 인증 +1
            user.setStreakDays(user.getStreakDays() + 1);
        } else if (lastVerificationDate.equals(today)) {
            // 오늘 이미 인증한 경우는 변경 없음
            return;
        } else {
            // 연속 인증이 끊긴 경우 1부터 다시 시작
            user.setStreakDays(1);
        }

        user.setLastVerificationDate(today);
        userRepository.save(user);
    }
}