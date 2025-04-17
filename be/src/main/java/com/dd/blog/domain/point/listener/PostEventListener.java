package com.dd.blog.domain.point.listener;

import com.dd.blog.domain.point.service.PointService;
import com.dd.blog.domain.post.event.PostCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostEventListener {

    private final PointService pointService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostCreatedEvent(PostCreatedEvent event) {

        try {
            pointService.addPointsForNewPost(event.getPost());
        } catch (Exception e) {
            log.error("포인트 적립 실패 postId = {}", event.getPost().getId());
        }
    }
}
