package com.dd.blog.domain.post.post.repository;

import com.dd.blog.domain.post.post.entity.Post;
import com.dd.blog.domain.post.category.entity.Category;
import com.dd.blog.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 카테고리 ID로 조회(게시판 종류별:인증, 자유, 정보공유)
    List<Post> findByCategoryId(Long categoryId);

    // 팔로우한 유저들 ID로 조회
    List<Post> findByUserInOrderByCreatedAtDesc(List<User> users);

    Page<Post> findByUserInOrderByCreatedAtDesc(List<User> users, Pageable pageable);

    // 특정 사용자의 게시물 목록 조회
    List<Post> findByUserOrderByCreatedAtDesc(User user);

    Page<Post> findByCategoryIdOrderByIdAsc(Long categoryId, Pageable pageable);

    // 카테고리 ID로 게시글 페이지 조회
    Page<Post> findByCategoryIdOrderByCreatedAtDesc(Long categoryId, Pageable pageable);

    // 오늘 생성된 게시글 개수 반환
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 사용자 정의 JPQL 쿼리: 검색 타입(type)이 'title'이면 제목에서, 'writer'면 작성자 닉네임에서 keyword를 LIKE 검색
    @Query("SELECT p FROM Post p " +
            "WHERE (:type = 'title' AND p.title LIKE %:keyword%) " +
            "   OR (:type = 'writer' AND p.user.nickname LIKE %:keyword%)")
    List<Post> searchByTypeAndKeyword(@Param("type") String type, @Param("keyword") String keyword);

    long countByUserIdAndCategoryIdAndCreatedAtBetween(Long userId, Long categoryId, LocalDateTime start, LocalDateTime end);

    // 팔로우한 유저 기준 조회
    Page<Post> findByUserIn(List<User> users, Pageable pageable);

    // 카테고리 ID 기준 조회
    Page<Post> findByCategoryId(Long categoryId, Pageable pageable);

    // 검색 결과 페이징
    @Query("SELECT p FROM Post p " +
            "WHERE (:type = 'title' AND p.title LIKE %:keyword%) " +
            "   OR (:type = 'writer' AND p.user.nickname LIKE %:keyword%)")
    Page<Post> searchByTypeAndKeywordPageable(@Param("type") String type, @Param("keyword") String keyword, Pageable pageable);
}
