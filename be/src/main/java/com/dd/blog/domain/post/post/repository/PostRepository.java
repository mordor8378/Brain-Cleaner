package com.dd.blog.domain.post.post.repository;

import com.dd.blog.domain.post.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByPostId(Long post_id);
}
