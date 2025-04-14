package com.dd.blog.domain.post.comment.dto;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDto {
    private Long id;
    private Long postId;
    private Long userId;
    private Long parent_id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}