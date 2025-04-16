package com.dd.blog.global.rq;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.service.UserService;
import com.dd.blog.global.security.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.Optional;

/**
 * Request/Response를 추상화한 객체
 * 요청 단위로 빈이 생성되어 관리됨
 */
@Slf4j
@RequestScope
@Component
@RequiredArgsConstructor
public class Rq {
    private final HttpServletRequest req;
    private final HttpServletResponse resp;
    private final UserService userService;

    public User getUserFromAccessToken(String accessToken) {
        return userService.getUserFromAccessToken(accessToken);
    }

    // 사용자를 로그인 상태로 설정
    public void setLogin(User user) {
        try {
            UserDetails userDetails = new SecurityUser(
                    user.getId(),
                    user.getEmail(),
                    "",
                    user.getNickname(),
                    user.getAuthorities()
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            System.out.println("Error setting login: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 현재 로그인한 사용자 정보 반환
    public User getActor() {
        return Optional.ofNullable(
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                )
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof SecurityUser)
                .map(principal -> (SecurityUser) principal)
                .map(securityUser -> User.builder()
                        .id(securityUser.getId())
                        .email(securityUser.getUsername())
                        .nickname(securityUser.getNickname())
                        .build())
                .orElse(null);
    }

    // 쿠키 설정
    public void setCookie(String name, String value) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .build();
        resp.addHeader("Set-Cookie", cookie.toString());
    }

    // 쿠키 값 가져오기
    public String getCookieValue(String name) {
        return Optional
                .ofNullable(req.getCookies())
                .stream()
                .flatMap(Arrays::stream)
                .filter(cookie -> cookie.getName().equals(name))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    // 쿠키 삭제
    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(0)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    // 인증 쿠키 생성
    public String makeAuthCookies(User user) {
        String accessToken = userService.genAccessToken(user);

        setCookie("refreshToken", user.getRefreshToken());
        setCookie("accessToken", accessToken);

        return accessToken;
    }

    // HTTP 헤더 설정
    public void setHeader(String name, String value) {
        resp.setHeader(name, value);
    }

    // HTTP 헤더 가져오기
    public String getHeader(String name) {
        return req.getHeader(name);
    }

    // 액세스 토큰 갱신
    public void refreshAccessToken(User user) {
        String newAccessToken = userService.genAccessToken(user);

        setHeader("Authorization", "Bearer " + newAccessToken);
        setCookie("accessToken", newAccessToken);
    }

    public User refreshAccessTokenByRefreshToken(String refreshToken) {
        return userService.findByRefreshToken(refreshToken)
                .map(user -> {
                    refreshAccessToken(user);
                    return user;
                })
                .orElse(null);
    }
}