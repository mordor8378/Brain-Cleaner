package com.dd.blog.domain.post.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentUpdateResponseDto {
    private Long id;
    private String content;
    private LocalDateTime updatedAt;
}