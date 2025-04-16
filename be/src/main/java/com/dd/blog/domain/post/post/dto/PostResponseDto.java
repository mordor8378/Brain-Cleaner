package com.dd.blog.domain.post.post.dto;

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
}