package com.dd.blog.domain.post.comment.entity;

import com.dd.blog.domain.post.category.entity.Post;
import com.dd.blog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
@Table(name="comment")
public class Comment extends BaseEntity {
//    //기본키
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long comment_id;
    //외래키
    @ManyToOne
    @JoinColumn(name="post_id")
    private Post post;
    @ManyToOne
    @JoinColumn(name="post_id")
    private User user;

    //대댓글 (자기참조)
    @ManyToOne
    @JoinColumn(name="parent_id")
    private Comment parent;
//    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
//    private List<Comment> children = new ArrayList<>(); //대댓글 목록

    private String content;
}
