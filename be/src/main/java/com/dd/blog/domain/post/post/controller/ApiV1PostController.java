package com.dd.blog.domain.post.post.controller;

import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class ApiV1PostController {
    private final PostService postService;

    //전체 게시글 조회
    @Operation(
            summary = "전체 게시글 조회",
            description = "등록된 모든 게시글을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공")
            }
    )
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts(){
        List<PostResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    //특정 카테고리 게시글 조회
    @Operation(
            summary = "카테고리별 게시글 조회",
            description = "카테고리 ID를 통해 해당 카테고리에 속한 게시글들을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 카테고리 없음")
            }
    )
    @GetMapping(params = "categoryId")
    public ResponseEntity<List<PostResponseDto>> getPostByCategory(@RequestParam Long categoryId){
        List<PostResponseDto> posts = postService.getPostByCategory(categoryId);
        return ResponseEntity.ok(posts);
    }

    //게시글 상세보기
    @Operation(
            summary = "게시글 상세보기",
            description = "게시글 ID를 통해 특정 게시글을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long postId){
        PostResponseDto post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    //게시글 작성
    @Operation(
            summary = "게시글 작성",
            description = "카테고리 ID와 게시글 내용을 입력하여 새로운 게시글을 작성합니다.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "작성 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 카테고리 없음")
            }
    )
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<PostResponseDto> writePost(@PathVariable Long categoryId, @Valid @RequestBody PostRequestDto postRequestDto){
        PostResponseDto responseDto = postService.createPost(categoryId, postRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    //게시글 수정
    @Operation(
            summary = "게시글 수정",
            description = "게시글 ID와 수정할 내용을 입력하여 게시글을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "수정 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long postId, @Valid @RequestBody PostRequestDto postRequestDto){
        PostResponseDto responseDto = postService.updatePost(postId, postRequestDto);
        return ResponseEntity.ok(responseDto);
    }

    //게시글 삭제
    @Operation(
            summary = "게시글 삭제",
            description = "게시글 ID를 통해 특정 게시글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "삭제 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId){
        postService.deletePost(postId);
        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }

    //게시글 검색_부가기능



}