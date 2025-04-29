package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.admin.dto.AdminReportDto;
import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.report.entity.Report;
import com.dd.blog.domain.report.entity.ReportStatus;
import com.dd.blog.domain.report.repository.ReportRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    private final ReportRepository reportRepository;

    public Page<AdminReportDto> getPendingReports(Pageable pageable) {

        Page<Report> reportPage = reportRepository.findByStatusOrderByCreatedAtAsc(ReportStatus.PENDING, pageable);

        return reportPage.map(this::convertToAdminReportDto); // 아래 헬퍼 메소드 사용
    }


    private AdminReportDto convertToAdminReportDto(Report report) {
        User reporter = report.getReporter();
        Long reporterId = (reporter != null) ? reporter.getId() : null;
        String reporterNickname = (reporter != null) ? reporter.getNickname() : "[알 수 없음]";

        User author = report.getReportedPostAuthor();
        Long reportedPostAuthorId = (author != null) ? author.getId() : null;
        String reportedPostAuthorNickname = (author != null) ? author.getNickname() : "[작성자 정보 없음]";

        Post reportedPost = report.getReportedPost();
        Long reportedPostId = null;
        String reportedPostTitle = "[삭제된 게시글]";
        String reportedPostContent = "";
        String reportedPostCategoryName = "";
        String[] reportedPostImageUrl = null;

        if (reportedPost != null) {
            reportedPostId = reportedPost.getId();
            reportedPostTitle = reportedPost.getTitle();
            reportedPostContent = reportedPost.getContent();
            reportedPostImageUrl = reportedPost.getImageUrl();

            Category category = reportedPost.getCategory();
            if (category != null) {
                reportedPostCategoryName = category.getCategoryName();
            }
        }

        return new AdminReportDto(
                report.getId(),
                report.getReason(),
                report.getStatus(),
                report.getCreatedAt(),
                reporterId,
                reporterNickname,
                reportedPostId,
                reportedPostTitle,
                reportedPostContent,
                reportedPostAuthorId,
                reportedPostAuthorNickname,
                reportedPostCategoryName,
                reportedPostImageUrl
        );
    }

    @Transactional
    public void updateReportStatus(Long reportId, ReportStatus newStatus) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ApiException(ErrorCode.REPORT_NOT_FOUND));

        report.changeStatus(newStatus);
    }

}


