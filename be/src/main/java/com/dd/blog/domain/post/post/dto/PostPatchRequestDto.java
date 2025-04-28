package com.dd.blog.domain.post.post.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostPatchRequestDto {
    private String title;
    private String content;
    private String[] imageUrl;
}
