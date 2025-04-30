package com.dd.blog.domain.user.user.service;

import com.dd.blog.domain.user.user.dto.*;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.aws.AwsS3Uploader;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final AwsS3Uploader awsS3Uploader;

    /**
     * 이메일 중복 체크
     */
    @Transactional(readOnly = true)
    public boolean isEmailDuplicate(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * 닉네임 중복 체크
     */
    @Transactional(readOnly = true)
    public boolean isNicknameDuplicate(String nickname) {
        return userRepository.findByNickname(nickname).isPresent();
    }

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
                .status(UserStatus.ACTIVE)
                .remainingPoint(0)
                .totalPoint(0)
                .refreshToken(null)
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

            user.updateRefreshToken(authTokenService.genRefreshToken(user));

            return userRepository.save(user);
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 랜덤 비밀번호
                    .nickname(nickname)
                    .ssoProvider(providerTypeCode)
                    .socialId(oauthId)
                    .role(UserRole.ROLE_USER_SPROUT)
                    .status(UserStatus.ACTIVE)
                    .remainingPoint(0)
                    .totalPoint(0)
                    .refreshToken(authTokenService.genRefreshTokenByEmail(email))
                    .build();
            return userRepository.save(newUser);
        }
    }

    /**
     * 로그인
     */
    @Transactional
    public UserResponseDto login(LoginRequestDto request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(ErrorCode.INVALID_PASSWORD);
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ApiException(ErrorCode.ACCOUNT_SUSPENDED);
        }

        // 리프레시 토큰 생성
        String refreshToken = authTokenService.genRefreshToken(user);

        // 리프레시 토큰 저장
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);

        return UserResponseDto.fromEntity(user);
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

        // 리프레시 토큰 무효화
        user.updateRefreshToken(null);
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
    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    //잔여 포인트 확인
    @Transactional(readOnly = true)
    public int remainingPoint(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        UserResponseDto dto = UserResponseDto.fromEntity(user);
        return dto.getRemainingPoint();
    }

    //프로필정보 수정
    @Transactional
    public UserResponseDto updateProfile(Long userId, UpdateProfileRequestDto request, MultipartFile profileImage) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        String imageUrl = request.getProfileImageUrl(); //새로 바꾼 사진이 없다면 기존 사진 유지

        // 이미지 파일이 있는 경우 확장자 및 크기 검증
        if (profileImage != null && !profileImage.isEmpty()) {
            // 파일 확장자 검증
            String originalFilename = profileImage.getOriginalFilename();
            if (originalFilename != null) {
                String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
                if (!extension.equals("jpg") && !extension.equals("jpeg") && !extension.equals("png")) {
                    throw new ApiException(ErrorCode.INVALID_INPUT_VALUE);
                }
            }

            // 파일 크기 검증 (예: 5MB 이하)
            if (profileImage.getSize() > 5 * 1024 * 1024) {
                throw new ApiException(ErrorCode.INVALID_INPUT_VALUE);
            }
            // 3. S3 업로드
            imageUrl = awsS3Uploader.upload(profileImage, "images/profile");
        }

        user.updateProfile(
                request.getNickname(),
                request.getEmail(),
                request.getStatusMessage(),
                request.getDetoxGoal(),
                request.getBirthDate(),
                imageUrl
        );
        return UserResponseDto.fromEntity(user);
    }

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


        // ACTIVE 상태인 경우만 토큰 갱신
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

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