package com.dd.blog.domain.post.post.repository;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 카테고리 ID로 조회(게시판 종류별:인증, 자유, 정보공유)
    List<Post> findByCategoryId(Long categoryId);

    // 팔로우한 유저들 ID로 조회
    List<Post> findByUserInOrderByCreatedAtDesc(List<User> users);

    // 특정 사용자의 게시물 목록 조회
    List<Post> findByUserOrderByCreatedAtDesc(User user);

    // 카테고리 ID로 게시글 페이지 조회
    Page<Post> findByCategoryIdOrderByCreatedAtDesc(Long categoryId, Pageable pageable);
}
