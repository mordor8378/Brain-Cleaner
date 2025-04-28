package com.dd.blog.global.security;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.rq.Rq;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {
    private final Rq rq;

    private record AuthTokens(String refreshToken, String accessToken) {
    }

    /**
     * 요청에서 토큰 추출
     */
    private AuthTokens getAuthTokensFromRequest() {
        String authorization = rq.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            // Bearer 다음의 값을 액세스 토큰으로 취급
            String accessToken = authorization.substring("Bearer ".length());

            return new AuthTokens(null, accessToken);
        }

        String refreshToken = rq.getCookieValue("refreshToken");
        String accessToken = rq.getCookieValue("accessToken");

        if (accessToken != null) {
            return new AuthTokens(refreshToken, accessToken);
        }

        return null;
    }

    /**
     * Rq를 통해 액세스 토큰에서 사용자 정보 가져오기
     */
    private User getUserFromAccessToken(String accessToken) {
        return rq.getUserFromAccessToken(accessToken);
    }

    /**
     * Rq를 통해 리프레시 토큰으로 액세스 토큰 갱신
     */
    private User refreshAccessTokenByRefreshToken(String refreshToken) {
        return rq.refreshAccessTokenByRefreshToken(refreshToken);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // API 요청이 아닌 경우 필터 통과
        if (!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

//        // 로그아웃 엔드포인트는 인증 처리 건너뛰기
//        if (request.getRequestURI().equals("/api/v1/users/logout")) {
//            System.out.println("로그아웃 요청 - 인증 처리 건너뛰기");
//            filterChain.doFilter(request, response);
//            return;
//        }

        // 인증이 필요없는 엔드포인트 통과
        if (List.of(
                "/api/users/signup",
                "/api/users/login",
                "/api/users/refresh",
                "/api/v1/pointstore/items"
        ).contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        if (request.getMethod().equals("GET") && request.getRequestURI().startsWith("/api/v1/posts")) {
            if (!request.getRequestURI().contains("/like/check")) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        try {
            // 토큰 추출
            AuthTokens authTokens = getAuthTokensFromRequest();

            if (authTokens == null) {
                System.out.println("No auth tokens found");
                filterChain.doFilter(request, response);
                return;
            }

            String refreshToken = authTokens.refreshToken();
            String accessToken = authTokens.accessToken();

            // 액세스 토큰으로 사용자 정보 가져오기
            User user = getUserFromAccessToken(accessToken);

            // 액세스 토큰이 유효하지 않으면 리프레시 토큰으로 갱신
            if (user == null) {
                System.out.println("Access token invalid, trying refresh token");
                user = refreshAccessTokenByRefreshToken(refreshToken);
            }

            // 인증 정보 설정
            if (user != null) {
                System.out.println("Setting login for user: " + user.getEmail());
                rq.setLogin(user);
                System.out.println("Login set successfully");
            } else {
                System.out.println("User authentication failed");
            }
        } catch (Exception e) {
            System.out.println("Error in CustomAuthenticationFilter: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);

    }
}