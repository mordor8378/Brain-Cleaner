package com.dd.blog.domain.post.post.dto;

import com.dd.blog.domain.post.post.entity.Post;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponseDto {
    private Long postId;
    private Long userId;
    private String userNickname;
    private Long categoryId;

    private String title;
    private String content;
    private String imageUrl;
    private int viewCount;
    private int likeCount;

    private String verificationImageUrl;
    private Integer detoxTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public static PostResponseDto fromEntity(Post post) {
        return PostResponseDto.builder()
                .postId(post.getId())
                .userId(post.getUser().getId())
                .userNickname(post.getUser().getNickname())
                .categoryId(post.getCategory().getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .verificationImageUrl(post.getVerificationImageUrl())
                .detoxTime(post.getDetoxTime())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}