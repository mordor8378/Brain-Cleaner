package com.dd.blog.domain.post.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequestDto {
    private Long post_id;
    private Long parent_id;

    @NotBlank(message = "내용 입력은 필수입니다.")
    private String content;
 }