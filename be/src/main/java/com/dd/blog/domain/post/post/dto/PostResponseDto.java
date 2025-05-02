package com.dd.blog.domain.post.post.dto;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.user.user.entity.UserRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponseDto {
    private Long postId;
    private Long userId;
    private String userNickname;
    private UserRole userRole;
    private Long categoryId;

    private String title;
    private String content;
    private String[] imageUrl;
    private int viewCount;
    private int likeCount;
    private int commentCount;

    private String verificationImageUrl;
    private Integer detoxTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;

    public static PostResponseDto fromEntity(Post post) {
        // 이미지 URL 중복 처리
        String[] imageUrls = post.getImageUrl();
        String verificationImageUrl = null;
        
        // post/ 경로의 이미지 필터링 (중복 이미지 방지)
        if (imageUrls != null && imageUrls.length > 0) {
            List<String> filteredUrls = new ArrayList<>();
            for (String url : imageUrls) {
                // images/ 경로의 이미지만 유지 (post/ 경로 이미지 제외)
                if (url != null && !url.contains("/post/")) {
                    filteredUrls.add(url);
                }
            }
            imageUrls = filteredUrls.toArray(new String[0]);
        }
        
        // 인증 게시판인 경우 첫 번째 이미지를 verificationImageUrl로 설정
        if (post.getCategory().getId() == 1L && imageUrls != null && imageUrls.length > 0) {
            verificationImageUrl = imageUrls[0];
        }
        
        return PostResponseDto.builder()
                .postId(post.getId())
                .userId(post.getUser().getId())
                .userNickname(post.getUser().getNickname())
                .userRole(post.getUser().getRole())
                .categoryId(post.getCategory().getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(imageUrls)
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getComments() != null ? post.getComments().size() : 0) // null 체크
                .verificationImageUrl(verificationImageUrl)
                .detoxTime(post.getDetoxTime())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .status(null)
                .build();
    }
}