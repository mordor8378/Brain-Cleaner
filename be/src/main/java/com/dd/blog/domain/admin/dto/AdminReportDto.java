package com.dd.blog.domain.admin.dto;

import com.dd.blog.domain.report.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Schema(description = "게시글 신고 조회 DTO")
@Getter
@Setter
public class AdminReportDto {

    private Long reportId;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;

    private Long reporterId;
    private String reporterNickname;

    private Long reportedPostId;
    private String reportedPostTitle;
    private String reportedPostContent;
    private Long reportedPostAuthorId;
    private String reportedPostAuthorNickname;
    private String reportedPostCategoryName;
    private String[] reportedPostImageUrl;


    public AdminReportDto(Long reportId, String reason, ReportStatus status, LocalDateTime createdAt,
                          Long reporterId, String reporterNickname, Long reportedPostId,
                          String reportedPostTitle, String reportedPostContent,
                          Long reportedPostAuthorId, String reportedPostAuthorNickname,
                          String reportedPostCategoryName, String[] reportedPostImageUrl) {
        this.reportId = reportId;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
        this.reporterId = reporterId;
        this.reporterNickname = reporterNickname;
        this.reportedPostId = reportedPostId;
        this.reportedPostTitle = reportedPostTitle;
        this.reportedPostContent = reportedPostContent;
        this.reportedPostAuthorId = reportedPostAuthorId;
        this.reportedPostAuthorNickname = reportedPostAuthorNickname;
        this.reportedPostCategoryName = reportedPostCategoryName;
        this.reportedPostImageUrl = reportedPostImageUrl;
    }
}
