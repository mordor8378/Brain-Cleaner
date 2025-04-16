package com.dd.blog.domain.post.verification.service;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.domain.post.verification.dto.*;
import com.dd.blog.domain.post.verification.entity.*;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    public VerificationResponseDto createVerification(VerificationRequestDto requestDto) {
        // 사용자 ID로 사용자 조회 & 예외 처리
        try {
            User user = userRepository.findById(requestDto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

            // 게시글 ID로 게시글 조회 & 예외 처리
            Post post = postRepository.findById(requestDto.getPostId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

            // 인증 엔티티 생성
            Verification verification = Verification.builder()
                    .user(user) // 연관 사용자 설정
                    .post(post) // 연관 게시글 설정
                    .status(VerificationStatus.PENDING) //default 상태값: PENDING
                    .detoxTime(requestDto.getDetoxTime()) // 디톡스 시간 설정
                    .build();

            // 인증 정보 저장
            verificationRepository.save(verification);

            // 엔티티 DTO 변환
            return toDto(verification);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "인증 등록 중 오류가 발생했습니다.");
        }


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
        return VerificationResponseDto.builder()
                .verificationId(verification.getId())
                .userId(verification.getUser().getId())
                .postId(verification.getPost().getId())
                .status(verification.getStatus())
                .detoxTime(verification.getDetoxTime())
                .build();
    }

}