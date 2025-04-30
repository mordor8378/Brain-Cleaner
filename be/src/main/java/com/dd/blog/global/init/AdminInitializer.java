package com.dd.blog.global.init;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner  {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.initial.email}")
    String adminEmail;

    @Value("${admin.initial.password}")
    String adminPassword;

    @Value("${admin.initial.nickname}")
    String adminNickname;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {

        List<User> admins = userRepository.findByRole(UserRole.ROLE_ADMIN);

        if(admins.isEmpty()) {
            User admin = User.builder() // User 엔티티의 빌더 사용!
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .nickname(adminNickname)
                    .role(UserRole.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .remainingPoint(0)
                    .totalPoint(0)
                    .streakDays(0)
                    .build();

            userRepository.save(admin);

        }

    }
}
