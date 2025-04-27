package com.dd.blog.domain.report.service;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.report.dto.ReportCreateRequestDto;
import com.dd.blog.domain.report.entity.Report;
import com.dd.blog.domain.report.repository.ReportRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;     // Post 조회 위해 필요
    private final UserRepository userRepository;     // User 조회 위해 필요

    /**
     * 새로운 신고를 생성합니다.
     * @param request 신고 생성 요청 DTO (postId, reason 포함)
     * @param reporterId 신고자(로그인한 사용자)의 ID
     * @return 생성된 Report 엔티티의 ID
     */
    @Transactional // 데이터를 생성/변경하므로 @Transactional 필수!
    public Long createReport(ReportCreateRequestDto request, Long reporterId) {
        // 1. 신고된 게시글 엔티티 조회
        Post reportedPost = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));

        // 2. 신고자(User) 엔티티 조회
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));

        // 3. 신고된 게시글의 작성자(User) 엔티티 조회 (Report 엔티티에 저장하기 위해!)
        User author = reportedPost.getUser();
        if (author == null) {
            // 혹시 모를 예외 상황 처리 (Post에 User가 없는 경우)
            throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 4. 자기 자신의 게시글 신고 방지
        if (author.getId().equals(reporterId)) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        // 5. Report 엔티티 생성 (수정된 createReport 메소드 사용!)
        Report report = Report.createReport(
                reportedPost,       // 신고된 Post 객체
                author,             // 게시글 작성자 User 객체!
                reporter,           // 신고자 User 객체
                request.getReason() // 신고 사유
        ); // Report.java의 createReport 메소드 시그니처와 일치해야 함!

        // 6. Report 엔티티 저장
        Report savedReport = reportRepository.save(report);

        // 7. 생성된 Report ID 반환
        return savedReport.getId();
    }
}
