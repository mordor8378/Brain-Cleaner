package com.dd.blog.domain.user.follow.controller;

import com.dd.blog.domain.user.follow.dto.FollowRequestDto;
import com.dd.blog.domain.user.follow.dto.FollowResponseDto;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.follow.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "팔로우 관련 API")
public class ApiV1FollowerController {
    private final FollowService followService;

    @PostMapping
    @Operation(summary = "팔로우 하기", description = "특정 사용자를 팔로우합니다.")
    public ResponseEntity<FollowResponseDto> follow(
            @Valid @RequestBody FollowRequestDto request) {
        Follow follow = followService.follow(request.getFollowerId(), request.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(FollowResponseDto.fromEntity(follow));
    }

    @DeleteMapping("/{followId}")
    @Operation(summary = "팔로우 취소", description = "특정 팔로우를 취소합니다.")
    public ResponseEntity<Void> unfollow(
            @RequestParam Long userId,
            @PathVariable Long followId) {
        followService.unfollow(userId, followId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    @Operation(summary = "팔로우 여부 확인", description = "특정 사용자가 다른 사용자를 팔로우하고 있는지 확인합니다.")
    public ResponseEntity<Boolean> checkFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(isFollowing);
    }

    // TODO: 팔로워/팔로잉 목록 조회
}
