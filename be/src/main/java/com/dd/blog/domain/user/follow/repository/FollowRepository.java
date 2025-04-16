package com.dd.blog.domain.user.follow.repository;

import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    // 특정 사용자가 팔로우하는 사용자 목록
    List<Follow> findByFollower(User follower);

    // 특정 사용자를 팔로우하는 사용자 목록
    List<Follow> findByFollowing(User following);

    // 특정 사용자의 다른 사용자를 팔로우 여부
    boolean existsByFollowerAndFollowing(User follower, User following);
}
