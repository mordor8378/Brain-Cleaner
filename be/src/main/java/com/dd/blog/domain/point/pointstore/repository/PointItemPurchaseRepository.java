package com.dd.blog.domain.point.pointstore.repository;

import com.dd.blog.domain.point.pointstore.entity.PointItemPurchase;
import com.dd.blog.domain.point.pointstore.entity.PointItem;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointItemPurchaseRepository extends JpaRepository<PointItemPurchase, Long> {

    // 특정 유저가 구매한 모든 아이템 구매 내역을 조회
    List<PointItemPurchase> findByUser(User user);

    // 해당 유저가 특정 아이템을 구매했는지 여부 확인
    boolean existsByUserAndItem(User user, PointItem item);
}
