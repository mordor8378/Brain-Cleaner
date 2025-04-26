package com.dd.blog.domain.post.comment.repository;

import com.dd.blog.domain.post.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    List<Comment> findByPostId(Long post_id);
//    List<Comment> findByParentId(Long parent_id);
}
