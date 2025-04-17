package com.dd.blog.domain.user.user.service;

import com.dd.blog.domain.user.user.dto.LoginRequestDto;
import com.dd.blog.domain.user.user.dto.SignUpRequestDto;
import com.dd.blog.domain.user.user.dto.TokenResponseDto;
import com.dd.blog.domain.user.user.dto.UserResponseDto;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    /**
     * 회원가입
     */
    @Transactional
    public User signup(SignUpRequestDto request) {
        // 이메일 중복 체크
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 닉네임 중복 체크
        if (userRepository.findByNickname(request.getNickname()).isPresent()) {
            throw new ApiException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        // 유저 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(UserRole.ROLE_USER_SPROUT)
                .remainingPoint(0)
                .totalPoint(0)
                .refreshToken(UUID.randomUUID().toString()) // 초기 리프레시 토큰은 UUID로 설정
                .build();

        return userRepository.save(user);
    }

    /**
     * OAuth2 로그인 시 회원가입 또는 정보 업데이트
     */
    @Transactional
    public User joinOrUpdateOAuth2User(String providerTypeCode, String oauthId, String email, String nickname) {
        // 이메일로 사용자 검색
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // 기존 사용자가 있으면 정보 업데이트
            User user = existingUser.get();
            // 필요한 경우 닉네임 업데이트
            if (!user.getNickname().equals(nickname)) {
                user.updateNickname(nickname);
            }

            // socialId가 없으면(일반 회원이면) 소셜 정보 추가
            if (user.getSocialId() == null) {
                user.updateSocialInfo(providerTypeCode, oauthId);
            }

            return userRepository.save(user);
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 랜덤 비밀번호
                    .nickname(nickname)
                    .ssoProvider(providerTypeCode)
                    .socialId(oauthId)
                    .role(UserRole.ROLE_USER)
                    .remainingPoint(0)
                    .totalPoint(0)
                    .refreshToken(UUID.randomUUID().toString()) // 초기 리프레시 토큰
                    .build();

            return userRepository.save(newUser);
        }
    }

    /**
     * 로그인
     */
    @Transactional
    public TokenResponseDto login(LoginRequestDto request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }

        // 토큰 생성
        String accessToken = authTokenService.genAccessToken(user);
        String refreshToken = authTokenService.genRefreshToken(user);

        // 리프레시 토큰 저장
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .nickname(user.getNickname())
                .role(user.getRole())
                .build();
    }

    /**
     * 로그아웃
     */
    @Transactional
    public void logout(String accessToken) {
        User userFromToken = getUserFromAccessToken(accessToken);

        if (userFromToken == null) {
            throw new IllegalArgumentException("유효하지 않은 엑세스 토큰입니다.");
        }

        User user = userRepository.findById(userFromToken.getId())
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        System.out.println(user +"로그아웃 중");

        // 리프레시 토큰 무효화
        user.updateRefreshToken(null); // 또는 UUID.randomUUID().toString()도 OK
        userRepository.save(user);

        log.info("사용자 [{}] 로그아웃 처리 완료", user.getEmail());
    }

    /**
     * 사용자 ID로 조회
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 리프레시 토큰으로 사용자 조회
     */
    @Transactional(readOnly = true)
    public Optional<User> findByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshToken(refreshToken);
    }

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

    /**
     * 토큰 갱신
     */
    @Transactional
    public TokenResponseDto refreshToken(String refreshToken) {
        // 리프레시 토큰 유효성 검사
        if (!authTokenService.isValid(refreshToken)) {
            throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // DB에서 리프레시 토큰으로 사용자 조회
        User user = findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_REFRESH_TOKEN));

        // 새 토큰 발급
        String newAccessToken = authTokenService.genAccessToken(user);
        String newRefreshToken = authTokenService.genRefreshToken(user);

        // 리프레시 토큰 업데이트
        user.updateRefreshToken(newRefreshToken);
        userRepository.save(user);

        return TokenResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .nickname(user.getNickname())
                .role(user.getRole())
                .build();
    }

    /**
     * 액세스 토큰에서 사용자 정보 추출
     */
    public User getUserFromAccessToken(String accessToken) {
        Map<String, Object> payload = authTokenService.payload(accessToken);

        if (payload == null) return null;

        long id = ((Number) payload.get("id")).longValue();
        String email = (String) payload.get("email");
        String nickname = (String) payload.get("nickname");
        String roleString = (String) payload.get("role");
        UserRole role  = UserRole.valueOf(roleString);

        return User.builder()
                .id(id)
                .email(email)
                .nickname(nickname)
                .role(role)
                .build();
    }

    /**
     * 액세스 토큰 생성
     */
    public String genAccessToken(User user) {
        return authTokenService.genAccessToken(user);
    }
}