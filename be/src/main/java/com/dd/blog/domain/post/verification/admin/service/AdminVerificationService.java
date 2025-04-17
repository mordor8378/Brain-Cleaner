package com.dd.blog.domain.post.verification.admin.service;
import com.dd.blog.domain.point.service.PointService;
import com.dd.blog.domain.post.verification.dto.VerificationResponseDto;
import com.dd.blog.domain.post.verification.entity.Verification;
import com.dd.blog.domain.post.verification.entity.VerificationStatus;
import com.dd.blog.domain.post.verification.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminVerificationService {

    private final VerificationRepository verificationRepository;
    private final PointService pointService;

    @Transactional
    public void approveVerification(Long verificationId) {

        Verification verification = findAndValidateVerification(verificationId);
        verification.setStatus(VerificationStatus.APPROVED);

        pointService.addPointsForCertificationApproval(verification);

    }

    @Transactional
    public void rejectVerification(Long verificationId) {

        Verification verification = findAndValidateVerification(verificationId);
        verification.setStatus(VerificationStatus.REJECTED);
    }

    // 주어진 ID로 Verification 엔티티를 조회하고 PENDING 상태인지 검증
    private Verification findAndValidateVerification(Long verificationId) {
        Verification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> {
                    return new IllegalArgumentException("해당 ID의 인증 요청을 찾을 수 없음");
                });
        // 인증 상태가 PENDING이 아니라면
        if (verification.getStatus() != VerificationStatus.PENDING)
            throw new IllegalArgumentException("이미 처리된 인증 요청입니다. 현재 상태 : " + verification.getStatus());

        return verification;
    }



    // PENDING 상태 인증 요청 목록 조회 메서드 구현
    @Transactional(readOnly = true)
    public Page<Verification> getPendingVerification(Pageable pageable) {
        return verificationRepository.findByStatusOrderByIdAsc(VerificationStatus.PENDING, pageable);
    }


}
