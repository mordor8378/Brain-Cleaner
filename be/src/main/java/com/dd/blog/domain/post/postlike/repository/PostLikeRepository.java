package com.dd.blog.domain.post.postlike.repository;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.postlike.entity.PostLike;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
}
