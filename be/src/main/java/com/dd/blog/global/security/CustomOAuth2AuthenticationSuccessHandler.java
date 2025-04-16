package com.dd.blog.global.security;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.service.UserService;
import com.dd.blog.global.rq.Rq;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
    private final ApplicationContext applicationContext;
    private final Rq rq;

    @SneakyThrows
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        UserService userService = applicationContext.getBean(UserService.class);

        // rq.getActor()로 시큐리티에서 로그인된 회원정보 가져오기
        User user = userService.getUserById(rq.getActor().getId());

        // 토큰 발급
        rq.makeAuthCookies(user);

        String redirectUrl = request.getParameter("state");

        // 프론트 주소로 redirect
        response.sendRedirect(redirectUrl);
    }
}