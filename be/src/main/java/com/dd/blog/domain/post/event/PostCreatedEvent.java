package com.dd.blog.domain.post.event;

import com.dd.blog.domain.post.post.entity.Post;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

// 자유게시판, 정보공유게시판에서 신규 게시글 생성시 발생되는 이벤트 객체

@Getter
public class PostCreatedEvent extends ApplicationEvent {

    private final Post post;

    public PostCreatedEvent(Object source, Post post) {
        super(source);
        this.post = post;
    }

}
