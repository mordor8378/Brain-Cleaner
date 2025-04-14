package com.dd.blog.domain.post.verification.repository;

import com.dd.blog.domain.post.verification.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<Verification, Long> {
}
