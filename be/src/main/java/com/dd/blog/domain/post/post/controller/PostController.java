package com.dd.blog.domain.post.post.controller;

import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.service.PostService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    //전체 게시글 조회
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts(){
        List<PostResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    //특정 카테고리 게시글 조회
    @GetMapping(params = "categoryId")
    public ResponseEntity<List<PostResponseDto>> getPostByCategory(@RequestParam Long categoryId){
        List<PostResponseDto> posts = postService.getPostByCategory(categoryId);
        return ResponseEntity.ok(posts);
    }

    //게시글 상세보기
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long postId){
        PostResponseDto post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    //게시글 작성
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<PostResponseDto> writePost(@PathVariable Long categoryId, @Valid @RequestBody PostRequestDto postRequestDto){
        PostResponseDto responseDto = postService.createPost(categoryId, postRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    //게시글 수정
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long postId, @Valid @RequestBody PostRequestDto postRequestDto){
        PostResponseDto responseDto = postService.updatePost(postId, postRequestDto);
        return ResponseEntity.ok(responseDto);
    }

    //게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId){
        postService.deletePost(postId);
        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }

    //게시글 검색_부가기능



}