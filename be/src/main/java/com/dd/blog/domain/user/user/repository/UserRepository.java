package com.dd.blog.domain.user.user.repository;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    Optional<User> findByRefreshToken(String refreshToken);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<User> findByRole(UserRole role);
}
