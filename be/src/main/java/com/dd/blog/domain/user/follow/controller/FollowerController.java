package com.dd.blog.domain.user.follow.controller;

import com.dd.blog.domain.user.follow.dto.FollowRequestDto;
import com.dd.blog.domain.user.follow.dto.FollowResponseDto;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.follow.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowerController {
    private final FollowService followService;

    @PostMapping
    public ResponseEntity<FollowResponseDto> follow(
            @Valid @RequestBody FollowRequestDto request) {
        Follow follow = followService.follow(request.getFollowerId(), request.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(FollowResponseDto.fromEntity(follow));
    }

    @DeleteMapping("/{followId}")
    public ResponseEntity<Void> unfollow(
            @RequestParam Long userId,
            @PathVariable Long followId) {
        followService.unfollow(userId, followId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(isFollowing);
    }

    // TODO: 팔로워/팔로잉 목록 조회
}
