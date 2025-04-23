package com.dd.blog.domain.post.comment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("post_id")
    private Long postId;
    @JsonProperty("parent_id")
    private Long parentId;

    @NotBlank(message = "내용 입력은 필수입니다.")
    private String content;
 }