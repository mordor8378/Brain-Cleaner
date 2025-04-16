package com.dd.blog.global.security;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.exception.ApiException;
import com.dd.blog.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(this::createUserDetails)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    private UserDetails createUserDetails(User user) {
        return new SecurityUser(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getNickname(),
                user.getAuthorities()
        );
    }
}