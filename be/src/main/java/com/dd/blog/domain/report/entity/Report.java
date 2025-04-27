package com.dd.blog.domain.report.entity;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = {"reportedPost", "reporter", "reportedPostAuthor"})
@Table(name = "report")
public class Report extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = true)
    private Post reportedPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_post_author_id")
    private User reportedPostAuthor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User reporter;

    @Lob
    @Column(name = "reason", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status;

    public static Report createReport(Post post, User reportedPostAuthor, User reporter, String reason) {
        return Report.builder()
                .reportedPost(post)
                .reportedPostAuthor(reportedPostAuthor)
                .reporter(reporter)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .build();
    }

    // 상태 변경 메서드
    public void changeStatus(ReportStatus newStatus) {
        this.status = newStatus;
    }

}
