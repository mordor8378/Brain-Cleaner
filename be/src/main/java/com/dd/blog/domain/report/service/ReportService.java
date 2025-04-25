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
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public Long createReport(ReportCreateRequestDto request, Long reporterId) {
        // 신고된 게시글
        Post reportedPost = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));

        // 신고한 회원
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if (reportedPost.getUser().getId().equals(reporterId))
            throw new ApiException(ErrorCode.CANNOT_REPORT_OWN_POST);

        Report report = Report.createReport(reportedPost, reporter, request.getReason());

        // 신고 정보 저장
        Report savedReport = reportRepository.save(report);

        return savedReport.getId();
    }

}
