package com.dd.blog.domain.point.service;

import com.dd.blog.domain.point.dto.PointHistoryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// 클래스와 메서드는 임시로 abstract로 선언 -> 추후 구현 필요!
public abstract class PointHistoryService {

    public abstract Page<PointHistoryResponseDto> getUserPointHistory(Long userid, Pageable pageable);
}
