package com.dd.blog.domain.post.comment.entity;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.user.user.entity.User;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
@Table(name="comment")
public class Comment extends BaseEntity {
    //외래키
    @ManyToOne
    @JoinColumn(name="post_id")
    private Post post;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    //대댓글 (자기참조)
    @ManyToOne
    @JoinColumn(name="parent_id")
    private Comment parent;
//    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
//    private List<Comment> children = new ArrayList<>(); //대댓글 목록

    @Column(name = "content", nullable = false, length=100)
    private String content;
}
