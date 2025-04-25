package com.dd.blog.domain.point.pointstore.controller;

import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseListDto;
import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseRequestDto;
import com.dd.blog.domain.point.pointstore.dto.PointItemPurchaseResultDto;
import com.dd.blog.domain.point.pointstore.dto.PointItemResponseDto;
import com.dd.blog.domain.point.pointstore.entity.PointItem;
import com.dd.blog.domain.point.pointstore.repository.PointItemRepository;
import com.dd.blog.domain.point.pointstore.service.PointStoreService;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.domain.user.user.repository.UserRepository;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * - 구매, 조회, 내 구매내역 등 포인트 기반 상점 기능을 제공
 */
@Tag(name = "Point Store", description = "포인트 상점 API")
@RestController
@RequestMapping("/api/v1/pointstore")
@RequiredArgsConstructor
public class PointStoreController {

    private final PointStoreService pointStoreService;
    private final PointItemRepository pointItemRepository;
    private final UserRepository userRepository;


    /**
     * [POST] /purchase
     * 사용자가 아이템을 포인트로 구매하는 API
     *
     * @param requestDto 구매할 아이템 ID 포함
     * @return 구매 결과 DTO (이름, 가격, 잔여 포인트)
     */
    @Operation(summary = "아이템 구매", description = "사용자가 포인트로 아이템을 구매합니다.")
    @PostMapping("/purchase")
    public ResponseEntity<PointItemPurchaseResultDto> purchaseItem(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestBody @Valid PointItemPurchaseRequestDto requestDto
    ) {
        Long currentUserId = principal.getId();

        PointItemPurchaseResultDto response = pointStoreService.purchaseItem(currentUserId, requestDto);
        return ResponseEntity.ok(response);
    }


    /**
     * [GET] /items
     * 상점에 등록된 모든 아이템을 조회하는 API
     * - 프론트의 상점 목록 페이지에서 사용
     *
     * @return PointItemResponseDto 리스트
     */
    @Operation(summary = "상점 아이템 목록 조회", description = "상점에 등록된 모든 아이템을 조회합니다.")
    @GetMapping("/items")
    public ResponseEntity<List<PointItemResponseDto>> getAllItems() {
        List<PointItem> items = pointItemRepository.findAll();

        List<PointItemResponseDto> result = items.stream()
                .map(item -> PointItemResponseDto.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .imageUrl(item.getImageUrl())
                        .code(item.getCode())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    /**
     * [GET] /my-purchases
     * 로그인 유저가 지금까지 구매한 아이템 목록을 조회
     * - 마이페이지 > 구매 내역에서 사용
     *
     * @param principal Spring Security 인증 객체 (SecurityUser)
     * @return 내가 구매한 아이템 정보 리스트
     */
    @Operation(summary = "내가 구매한 아이템 목록", description = "유저가 구매한 포인트 아이템을 모두 반환합니다.")
    @GetMapping("/my-purchases")
    public ResponseEntity<List<PointItemPurchaseListDto>> getMyPurchases(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        Long userId = principal.getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));
        return ResponseEntity.ok(pointStoreService.getMyPurchases(user));
    }

    @Operation(summary = "이모티콘 구매 여부 확인", description = "특정 이모티콘을 구매했는지 확인합니다.")
    @GetMapping("/check-purchased/{itemId}")
    public ResponseEntity<Boolean> checkPurchased(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long itemId
    ) {
        Long userId = user.getId();
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));

        PointItem item = pointItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("해당 아이템이 존재하지 않습니다."));

        boolean purchased = pointStoreService.checkUserOwnsItem(target, item);
        return ResponseEntity.ok(purchased);
    }
}
