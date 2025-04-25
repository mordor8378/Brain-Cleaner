package com.dd.blog.domain.point.pointstore.service;

import com.dd.blog.domain.point.point.entity.PointHistory;
import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseListDto;
import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseRequestDto;
import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseResultDto;
import com.dd.blog.domain.point.pointstore.entity.PointItem;
import com.dd.blog.domain.point.pointstore.entity.PointItemPurchase;
import com.dd.blog.domain.point.pointstore.repository.PointItemPurchaseRepository;
import com.dd.blog.domain.point.pointstore.repository.PointItemRepository;
import com.dd.blog.domain.point.point.repository.PointHistoryRepository;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PointStoreService {

    private final UserRepository userRepository;
    private final PointItemRepository pointItemRepository;
    private final PointItemPurchaseRepository pointItemPurchaseRepository;
    private final PointHistoryRepository pointHistoryRepository;

    /**
     * [POST] /api/v1/pointstore/purchase
     * 포인트 아이템을 구매하는 서비스 로직
     * - 유저 존재 여부 검증
     * - 아이템 존재 여부 검증
     * - 중복 구매 방지
     * - 포인트 잔액 확인 후 차감
     * - 구매 내역 및 포인트 히스토리 저장
     * @param userId 로그인한 유저의 ID
     * @param requestDto 구매 요청 정보 (itemId 포함)
     * @return 구매 결과 DTO
     */
    @Transactional
    public PointItemPurchaseResultDto purchaseItem(Long userId, PointItemPurchaseRequestDto requestDto) {

        // 유저, 아이템 조회; 없으면 예외발생
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저가 존재하지 않습니다."));

        PointItem item = pointItemRepository.findById(requestDto.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("해당 아이템이 존재하지 않습니다."));


        // 중복 구매 방지
        if (pointItemPurchaseRepository.existsByUserAndItem(user, item)) {
            throw new IllegalStateException("이미 구매한 아이템입니다.");
        }


        int price = item.getPrice();

        // 포인트 부족 검증
        if (user.getRemainingPoint() < item.getPrice()) {
            throw new IllegalArgumentException("포인트가 부족합니다.");
        }

        // 포인트 차감
        user.setRemainingPoint(user.getRemainingPoint() - price);


        // 구매 이력 저장
        PointItemPurchase purchase = PointItemPurchase.builder()
                .user(user)
                .item(item)
                .purchasedAt(LocalDateTime.now())
                .build();
        pointItemPurchaseRepository.save(purchase);


        // 포인트 히스토리 저장 (감소)
        PointHistory history = PointHistory.builder()
                .user(user)
                .pointChange(-price)
                .type("감소")
                .build();
        pointHistoryRepository.save(history);

        return PointItemPurchaseResultDto.builder()
                .itemName(item.getName())
                .itemPrice(price)
                .remainingPoint(user.getRemainingPoint())
                .build();
    }


    /**
     * [GET] /api/v1/pointstore/my-purchases
     * 유저가 구매한 아이템 목록 조회
     * @param user 현재 로그인된 유저
     * @return 구매한 아이템 리스트 DTO
     */
    @Transactional(readOnly = true)
    public List<PointItemPurchaseListDto> getMyPurchases(User user) {
        return pointItemPurchaseRepository.findByUser(user).stream()
                .map(purchase -> {
                    PointItem item = purchase.getItem();
                    System.out.println("구매 이력에서 꺼낸 itemId = " + item.getId());
                    return PointItemPurchaseListDto.builder()
                            .itemId(item.getId())
                            .name(item.getName())
                            .description(item.getDescription())
                            .price(item.getPrice())
                            .imageUrl(item.getImageUrl())
                            .code(item.getCode()) // 이모지 코드 추가
           .purchasedAt(purchase.getPurchasedAt())
                            .build();
                })
                .toList();
    }


    /**
     * [검증용 내부 호출]
     * 해당 유저가 특정 아이템을 실제로 구매했는지 확인
     * (댓글, 이모티콘 등 외부 기능에서 사용 가능)
     * @param user 로그인된 유저
     * @param item 검증할 아이템
     * @throws AccessDeniedException 구매하지 않은 경우 예외 발생
     */
    public void validateUserOwnsItem(User user, PointItem item) {
        boolean exists = pointItemPurchaseRepository.existsByUserAndItem(user, item);
        if (!exists) {
            throw new AccessDeniedException("해당 아이템을 구매하지 않았습니다.");
        }
    }

    @Transactional(readOnly = true)
    public boolean checkUserOwnsItem(User user, PointItem item) {
        return pointItemPurchaseRepository.existsByUserAndItem(user, item);
    }
}
