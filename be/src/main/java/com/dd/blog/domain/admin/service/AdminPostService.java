package com.dd.blog.domain.admin.service;

import com.dd.blog.domain.post.post.repository.PostRepository;
import com.dd.blog.domain.report.repository.ReportRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminPostService {

    private final PostRepository postRepository;
    private final ReportRepository reportRepository;

    @Transactional
    public void deletePostByAdmin(Long postId) {
        if(!postRepository.existsById(postId))
            throw new ApiException(ErrorCode.POST_NOT_FOUND);

        reportRepository.unlinkReportsFromPost(postId);

        postRepository.deleteById(postId);
    }

}
