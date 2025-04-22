package com.dd.blog.domain.post.post.repository;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 카테고리 ID로 조회(게시판 종류별:인증, 자유, 정보공유)
    List<Post> findByCategoryId(Long categoryId);

    // 팔로우한 유저들 ID로 조회
    List<Post> findByUserInOrderByCreatedAtDesc(List<User> users);

    // 특정 사용자의 게시물 목록 조회
    List<Post> findByUserOrderByCreatedAtDesc(User user);

    // 사용자 정의 JPQL 쿼리: 검색 타입(type)이 'title'이면 제목에서, 'writer'면 작성자 닉네임에서 keyword를 LIKE 검색
    @Query("SELECT p FROM Post p " +
            "WHERE (:type = 'title' AND p.title LIKE %:keyword%) " +
            "   OR (:type = 'writer' AND p.user.nickname LIKE %:keyword%)")
    List<Post> searchByTypeAndKeyword(@Param("type") String type, @Param("keyword") String keyword);
}


