package com.dd.blog.global.init;

import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.entity.UserStatus;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // 더미 유저를 위한 기본 비밀번호
        String defaultPassword = passwordEncoder.encode("Qwert12345!");

        // 더미 유저 데이터
        List<User> dummyUsers = Arrays.asList(
                createUser("keith@gmail.com", defaultPassword, "뉴비", UserRole.ROLE_USER_SPROUT, 0, 0, "안녕하세요!"),
                createUser("raz99@gmail.com", defaultPassword, "뚱이", UserRole.ROLE_USER_TRAINEE, 0, 150, "오늘부터 SNS 끊습니다"),
                createUser("tlgus3@gmail.com", defaultPassword, "오리", UserRole.ROLE_USER_EXPLORER, 400, 850, "아침형 인간"),
                createUser("deus7861@gmail.com", defaultPassword, "땃쥐", UserRole.ROLE_USER_CONSCIOUS, 1500, 2500, "틱톡은 하루 1시간만"),
                createUser("jennlee@gmail.com", defaultPassword, "제인", UserRole.ROLE_USER_DESTROYER, 2500, 5000, "디지털 미니멀리스트"),
                createUser("qwerty121@naver.com", defaultPassword, "모카", UserRole.ROLE_USER_CLEANER, 4000, 8000, "8개월째 디톡스 중입니다"),
                createUser("pinn34@naver.com", defaultPassword, "핀", UserRole.ROLE_USER_TRAINEE, 150, 250, "..."),
                createUser("dlwodn@naver.com", defaultPassword, "나무늘보", UserRole.ROLE_USER_EXPLORER, 400, 700, "하루 1시간 독서하기"),
                createUser("tmddn7421@naver.com", defaultPassword, "빌런", UserRole.ROLE_USER_DESTROYER, 4500, 6000, "💀"),
                createUser("sahur1@naver.com", defaultPassword, "지원", UserRole.ROLE_USER_CONSCIOUS, 2400, 3000, "😊")
        );

        // 더미 유저가 등록되어 있는지 확인 후 저장
        for (User user : dummyUsers) {
            if (userRepository.findByEmail(user.getEmail()).isEmpty()) {
                userRepository.save(user);
            }
        }
    }

    private User createUser(String email, String password, String nickname, UserRole role,
                            int remainingPoint, int totalPoint, String statusMessage) {
        return User.builder()
                .email(email)
                .password(password)
                .nickname(nickname)
                .role(role)
                .status(UserStatus.ACTIVE)
                .remainingPoint(remainingPoint)
                .totalPoint(totalPoint)
                .refreshToken(null)
                .statusMessage(statusMessage)
                .birthDate(getRandomBirthDate())
                .streakDays(0)
                .build();
    }

    private LocalDate getRandomBirthDate() {
        // 1980-2000년 사이의 랜덤 출생일 생성
        int year = 1980 + (int) (Math.random() * 20);
        int month = 1 + (int) (Math.random() * 12);
        int day = 1 + (int) (Math.random() * 28);

        return LocalDate.of(year, month, day);
    }
}