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
@ToString(exclude = {"reportedPost", "reporter"})
@Table(name = "report")
public class Report extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post reportedPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User reporter;

    @Lob
    @Column(name = "reason", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status;

    public static Report createReport(Post post, User reporter, String reason) {
        return Report.builder()
                .reportedPost(post)
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
