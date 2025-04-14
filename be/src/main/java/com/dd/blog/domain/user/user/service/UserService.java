package com.dd.blog.domain.user.user.service;

import com.dd.blog.domain.user.user.dto.LoginRequestDto;
import com.dd.blog.domain.user.user.dto.SignUpRequestDto;
import com.dd.blog.domain.user.user.dto.TokenResponseDto;
import com.dd.blog.domain.user.user.dto.UserResponseDto;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
//    User signup(SignUpRequestDto request);
//    TokenResponseDto login(LoginRequestDto request);
//    User getUserById(Long userId);
//    TokenResponseDto refreshToken(String refreshToken);
//    User deleteUser(Long userId);
    private final UserRepository userRepository;

    //계정 탈퇴
    @Transactional
    public void deleteUser(Long userId){
        //정말 탈퇴하시겠습니까? 한번 되묻는 과정이 필요할 듯 하다. -> 프론트에서 구현
        //깃허브에서는 레포지토리를 삭제할 때 깃허브 계정 비밀번호를 입력해야 삭제할 수 있던데 -> 시간이 남는다면 개발해보기

//        //탈퇴한 사용자가 작성한 글과 댓글을 "탈퇴한 사용자" 라고 보이게 하기위해 탈퇴 전 닉네임 변경
//        userRepository.findById(userId).ifPresent(user -> user.setNickname("탈퇴한 사용자"));

        userRepository.deleteById(userId);
    }

    //비밀번호 변경


    //잔여 포인트 확인
    @Transactional(readOnly = true)
    public int remainingPoint(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        UserResponseDto dto = UserResponseDto.fromEntity(user);
        return dto.getRemainingPoint();
    }

    //프로필정보 수정 - 프로필 상세조회 탭에 들어가면 수정가능-수정완료 버튼을 누르면 새롭게 들어온 UserResponseDTO를 가지고 update
    //
}
