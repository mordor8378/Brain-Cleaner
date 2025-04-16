package com.dd.blog.domain.user.follow.dto;

import com.dd.blog.domain.user.follow.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowResponseDto {
    private Long id;
    private Long followerId;
    private String followerNickname;
    private Long followingId;
    private String followingNickname;
    private LocalDateTime createdAt;

    public static FollowResponseDto fromEntity(Follow follow) {
        return FollowResponseDto.builder()
                .id(follow.getId())
                .followerId(follow.getFollower().getId())
                .followerNickname(follow.getFollower().getNickname())
                .followingId(follow.getFollowing().getId())
                .followingNickname(follow.getFollowing().getNickname())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
