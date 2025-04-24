package com.dd.blog.domain.post.verification.dto;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import com.dd.blog.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VerificationResponseDto {
    private Long verificationId;
    private Long postId;
    private Long userId;
    private VerificationStatus status;
    private int detoxTime;

    // 관리자 목록 화면
    private String userNickname;
    private String verificationImageUrl;
    private LocalDateTime createdAt;


    public static VerificationResponseDto fromEntity(Verification verification) {
        if(verification == null)
            return null;

        User user = verification.getUser();
        Post post = verification.getPost();

        String nickname = (user != null) ? user.getNickname() : null;
        String imageUrl = (post != null) ? post.getVerificationImageUrl() : null;
        Long postId = (post != null) ? post.getId() : null;
        Long userId = (user != null) ? user.getId() : null;

        return VerificationResponseDto.builder()
                .verificationId(verification.getId())
                .postId(postId)
                .userId(userId)
                .status(verification.getStatus())
                .detoxTime(verification.getDetoxTime())
                .userNickname(nickname)
                .verificationImageUrl(imageUrl)
                .createdAt(verification.getCreatedAt())
                .build();
    }

}
