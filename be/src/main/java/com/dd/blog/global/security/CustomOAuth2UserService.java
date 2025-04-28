package com.dd.blog.global.security;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.domain.user.user.service.UserService;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserService userService;

    // 소셜 로그인이 성공할 때마다 이 함수가 실행된다.
    @Transactional
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String oauthId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration()
                .getRegistrationId()
                .toUpperCase(Locale.getDefault());

        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 카카오는 kakao_account에 유저정보가 있고 그 안에 profile이라는 JSON 객체가 있다
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String nickname = (String) profile.get("nickname");
        String profileImgUrl = (String) profile.get("profile_image_url");
        String email = (String) kakaoAccount.get("email");
        // 이메일이 없는 경우 임의 이메일 생성
        if (email == null) {
            email = providerTypeCode + "__" + oauthId + "@example.com";
        }

        // 서비스 회원가입 또는 정보 업데이트
        User user = userService.joinOrUpdateOAuth2User(providerTypeCode, oauthId, email, nickname);

        if (user.getStatus() == UserStatus.SUSPENDED) {

            throw new ApiException(ErrorCode.ACCOUNT_SUSPENDED);
        }

        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                "",
                user.getNickname(),
                user.getAuthorities()
        );
    }
}