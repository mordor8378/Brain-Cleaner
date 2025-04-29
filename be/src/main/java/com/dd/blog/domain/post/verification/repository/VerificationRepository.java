package com.dd.blog.domain.post.verification.repository;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VerificationRepository extends JpaRepository<Verification, Long> {

    // 지정된 상태(status)의 인증 요청 목록을 ID 오름차순으로 페이징하여 조회
    Page<Verification> findByStatusOrderByIdAsc(VerificationStatus status, Pageable pageable);
    
    List<Verification> findByUserIdAndCreatedAtBetweenAndStatusIn(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            List<VerificationStatus> statuses);

    // 인증 게시글을 기반으로 인증 데이터 삭제
    void deleteByPost(Post post);

    // 지정된 상태(status)의 인증 요청 개수 반환
    long countByStatus(VerificationStatus status);

    // 지정된 상태(status)와 지정된 기간 (start - end)사이 인증 요청 개수 반환
    long countByStatusInAndUpdatedAtBetween(List<VerificationStatus> statuses, LocalDateTime start, LocalDateTime end);

    // postId로 Verification 조회
    Optional<Verification> findByPostId(Long postId);
}
