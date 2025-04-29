package com.dd.blog.domain.user.follow.service;

import com.dd.blog.domain.user.follow.dto.FollowResponseDto;
import com.dd.blog.domain.user.follow.entity.Follow;
import com.dd.blog.domain.user.follow.repository.FollowRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Transactional
    public FollowResponseDto follow(Long followerId, Long followingId){
        //팔로우기능
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // follower가 팔로우한 사람들 리스트 가져오기
        List<Follow> followList = followRepository.findByFollower(follower);

        // 이미 팔로우 중인지 확인
        for (Follow follow : followList) {
            if (follow.getFollowing().getId().equals(following.getId())) {
                throw new IllegalStateException("이미 팔로우 중입니다.");
                // 프론트에서 이미 팔로우 한 사람은 팔로우버튼을 다르게 설정
            }
        }

        Follow newFollow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        Follow savedFollow = followRepository.save(newFollow);
        return FollowResponseDto.fromEntity(savedFollow);
    }


    @Transactional
    public void unfollow(Long userId, Long followingId){
        User follower = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // 내가 팔로우한 사람들 리스트 가져오기
        List<Follow> followList = followRepository.findByFollower(follower);

        // 이미 팔로우 중인지 확인
        Follow target = null;
        for (Follow follow : followList) {
            if (follow.getFollowing().getId().equals(following.getId())) {
                target = follow;
                break;
            }
        }
        if (target == null) {
            throw new IllegalArgumentException("팔로우 관계가 존재하지 않습니다.");
        }
        followRepository.delete(target);
    }

    @Transactional
    public boolean isFollowing(Long followerId, Long followingId){
        //특정 사용자가 다른 사용자를 팔로우하고 있는지 확인
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        return followRepository.existsByFollowerAndFollowing(follower, following);
    }


    @Transactional
    public List<FollowResponseDto> getFollowers(Long userId){
        //나를 팔로우 하는 사람들 목록
        User follower = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        List<Follow> followerList = followRepository.findByFollowing(follower);

        return followerList.stream()
                .filter(follow -> !follow.getFollower().getId().equals(userId)) // 자기 자신 제외
                .map(FollowResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<FollowResponseDto> getFollowings(Long userId){
        //내가 팔로우 하는 사람들 목록
        User following = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        List<Follow> followingList = followRepository.findByFollower(following);

        return followingList.stream()
                .filter(follow -> !follow.getFollowing().getId().equals(userId)) // 자기 자신 제외
                .map(FollowResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

}