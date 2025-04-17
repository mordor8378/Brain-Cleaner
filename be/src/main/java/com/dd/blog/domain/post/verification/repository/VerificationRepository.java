package com.dd.blog.domain.post.verification.repository;

import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<Verification, Long> {

    // 지정된 상태(status)의 인증 요청 목록을 ID 오름차순으로 페이징하여 조회
    Page<Verification> findByStatusOrderByIdAsc(VerificationStatus status, Pageable pageable);
}
