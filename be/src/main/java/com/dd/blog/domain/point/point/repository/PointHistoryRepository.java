package com.dd.blog.domain.point.point.repository;

import com.dd.blog.domain.point.point.entity.PointHistory;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    Page<PointHistory> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
