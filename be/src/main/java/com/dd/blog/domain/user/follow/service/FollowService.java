package com.dd.blog.domain.user.follow.service;

import com.dd.blog.domain.user.follow.entity.Follow;

// TODO: 나중에 클래스로 바꾸고 구현
public interface FollowService {
    Follow follow(Long followerId, Long followingId);
    void unfollow(Long userId, Long followId);
    boolean isFollowing(Long followerId, Long followingId);
}
