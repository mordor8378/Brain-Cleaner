package com.dd.blog.domain.post.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequestDto {
    @NotBlank(message = "제목 입력은 필수입니다.")
    private String title;
    @NotBlank(message = "내용 입력은 필수입니다.")
    private String content;
    private String imageUrl;

    private Long userId;

    private String verificationImageUrl;
    private Integer detoxTime;
}