package com.dd.blog.domain.report.repository;

import com.dd.blog.domain.report.entity.Report;
import com.dd.blog.domain.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatusOrderByCreatedAtAsc(@Param("status") ReportStatus status, Pageable pageable);


    @Modifying // 데이터를 변경하는 쿼리이므로 필수!
    @Query("UPDATE Report r SET r.reportedPost = NULL WHERE r.reportedPost.id = :postId")
    void unlinkReportsFromPost(@Param("postId") Long postId);

    long countByStatus(ReportStatus reportStatus);
    long countByStatusInAndUpdatedAtBetween(List<ReportStatus> statuses, LocalDateTime start, LocalDateTime end);


}
