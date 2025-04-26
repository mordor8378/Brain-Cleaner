package com.dd.blog.domain.point.pointstore.repository;

import com.dd.blog.domain.point.pointstore.entity.PointItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PointItemRepository extends JpaRepository<PointItem, Long> {

    /**
     * [Query Method]
     * 이름을 기준으로 상점 아이템을 조회
     * - 관리자 초기 등록 중 중복 확인 시 사용
     * - Optional로 반환하여 존재 여부 안전하게 처리 가능
     *
     * @param name 조회할 아이템 이름
     * @return 해당 이름을 가진 PointItem (없을 경우 empty)
     */
    Optional<PointItem> findByName(String name);
}
