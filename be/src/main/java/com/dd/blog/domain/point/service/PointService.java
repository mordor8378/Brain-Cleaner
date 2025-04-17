package com.dd.blog.domain.point.service;

import com.dd.blog.domain.point.entity.PointHistory;
import com.dd.blog.domain.point.repository.PointHistoryRepository;
import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.entity.UserRole;
import com.dd.blog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PointService {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;

    private static final String INFO_CATEGORY_NAME = "정보공유게시판";
    private static final String FREE_CATEGORY_NAME = "자유게시판";
    private static final int INFO_POST_POINTS = 20;
    private static final int FREE_POST_POINTS = 10;
    private static final int CERTIFICATION_POINTS = 50;

    @Transactional // User 업데이트와 PointHistory 저장 처리
    public void addPointsForNewPost(Post post) {
        // 이벤트로 전달받은 Post 객체에서 User 객체 가져옴
        User user = post.getUser();
        String categoryName = post.getCategory().getCategoryName();

        int pointsToAdd = 0;
        String pointHistoryType = null;

        // 자유 게시판 & 정보 공유 게시판 글 작성시 포인트 적립 로직
        if (INFO_CATEGORY_NAME.equals(categoryName)) {
            pointsToAdd = INFO_POST_POINTS;
            pointHistoryType = "증가"; // PointHistory의 Type
        } else if (FREE_CATEGORY_NAME.equals(categoryName)) {
            pointsToAdd = FREE_POST_POINTS;
            pointHistoryType = "증가";
        }
        // 인증 게시판은 추후 별도로 처리

        // 자유 게시판 & 정보공유 게시판에 한에서만 적용
        if (pointsToAdd != 0 && pointHistoryType != null) {

            // 사용자 (작성자) 포인트 업데이트
            user.setTotalPoint(user.getTotalPoint() + pointsToAdd);
            user.setRemainingPoint(user.getRemainingPoint() + pointsToAdd);

            // PointHistory 생성 및 저장
            PointHistory history = PointHistory.builder()
                    .user(user)
                    .pointChange(pointsToAdd)
                    .type(pointHistoryType)
                    .build();
            pointHistoryRepository.save(history);

            // 자동등업 로직 호출
            upgradeUserRole(user);
            userRepository.save(user);

        }

    }

    @Transactional
    public void addPointsForCertificationApproval(Verification verification) {

        // 인증 요청한 사용자 정보
        User user = verification.getUser();

        int pointsToAdd = CERTIFICATION_POINTS;
        String pointHistoryType = "증가";

        user.setTotalPoint(user.getTotalPoint() + pointsToAdd);
        user.setRemainingPoint(user.getRemainingPoint() + pointsToAdd);

        PointHistory history = PointHistory.builder()
                .user(user)
                .pointChange(pointsToAdd)
                .type(pointHistoryType)
                .build();
        pointHistoryRepository.save(history);

        // 자동등업 로직 호출
        upgradeUserRole(user);
        userRepository.save(user);

    }

    private void upgradeUserRole(User user) {
        if(user == null || user.getRole() == UserRole.ROLE_ADMIN)
            return;

        UserRole currentRole = user.getRole();
        int totalPoints = user.getTotalPoint();

        UserRole targetRole = UserRole.getRoleForPoints(totalPoints);

        if(targetRole.isHigherThan(currentRole)) {
            user.setRole(targetRole);
            userRepository.save(user);
        }

    }
}
