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


import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "팔로우 관련 API")
public class ApiV1FollowerController {
    private final FollowService followService;

    @PostMapping
    @Operation(summary = "팔로우 하기", description = "특정 사용자를 팔로우합니다.")
    public ResponseEntity<FollowResponseDto> follow(
            @Valid @RequestBody FollowRequestDto request) {
        FollowResponseDto follow = followService.follow(request.getFollowerId(), request.getFollowingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(follow);
    }

    @DeleteMapping("/{followId}")
    @Operation(summary = "팔로우 취소", description = "팔로우를 취소합니다.")
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

    @GetMapping("/{userId}/followers/nicknames")
    @Operation(summary = "팔로워 조회", description = "나를 팔로우 하는 사람들을 조회합니다.")
    public ResponseEntity<List<String>> getFollowers(@PathVariable Long userId){
        List<String> followers = followService.getFollowers(userId).stream()
                .map(FollowResponseDto::getFollowerNickname)
                .collect(Collectors.toList());
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/followings/nicknames")
    @Operation(summary = "팔로잉 조회", description = "내가 팔로우 하는 사람들을 조회합니다.")
    public ResponseEntity<List<String>> getFollowings(@PathVariable Long userId){
        List<String> followings = followService.getFollowings(userId).stream()
                .map(FollowResponseDto::getFollowingNickname)
                .collect(Collectors.toList());
        return ResponseEntity.ok(followings);
    }

    @GetMapping("/{userId}/followers/number")
    @Operation(summary = "팔로워 수 조회", description = "나를 팔로우 하는 사람들의 수를 조회합니다.")
    public ResponseEntity<Integer> getFollowerNumber(@PathVariable Long userId){
        int followerNum = followService.getFollowers(userId).size();
        return ResponseEntity.ok(followerNum);
    }

    @GetMapping("/{userId}/followings/number")
    @Operation(summary = "팔로잉 수 조회", description = "나를 팔로우 하는 사람들의 수를 조회합니다.")
    public ResponseEntity<Integer> getFollowingNumber(@PathVariable Long userId){
        int followingNum = followService.getFollowings(userId).size();
        return ResponseEntity.ok(followingNum);
    }

    // TODO: 팔로워/팔로잉 목록 조회

}
