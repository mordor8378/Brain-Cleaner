package com.dd.blog.domain.post.post.controller;

import com.dd.blog.domain.post.post.dto.PostPatchRequestDto;
import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Post", description = "게시글 관련 API")
public class ApiV1PostController {

    private final PostService postService;

    //CREATE
    //게시글 CREATE
    @Operation(
            summary = "게시글 작성",
            description = "카테고리 ID와 게시글 내용을 입력하여 새로운 게시글을 작성합니다.",
            parameters = {
                    @Parameter(name = "categoryId", description = "카테고리 ID", required = true, example = "1")
            },
            responses = {
                    @ApiResponse(responseCode = "201", description = "작성 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 카테고리 없음")
            }
    )
    @PostMapping("/category/{categoryId}")
    public ResponseEntity<PostResponseDto> createPost(
            @Parameter(description = "카테고리 ID", required = true) @PathVariable Long categoryId,
            @Valid @RequestBody PostRequestDto postRequestDto){
        PostResponseDto responseDto = postService.createPost(categoryId, postRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }


    // READ
    // 전체 게시글 READ
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

    //특정 카테고리 게시판 READ
    @Operation(
            summary = "카테고리별 게시글 조회",
            description = "카테고리 ID를 통해 해당 카테고리에 속한 게시글들을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 카테고리 없음")
            }
    )
    @GetMapping(params = "categoryId")
    public ResponseEntity<List<PostResponseDto>> getPostsByCategory(
            @Parameter(description = "카테고리 ID", required = true) @RequestParam Long categoryId){
        List<PostResponseDto> posts = postService.getPostsByCategory(categoryId);
        return ResponseEntity.ok(posts);
    }

    // 팔로잉 대상 게시판 READ
    @GetMapping("/following/{userId}")
    @Operation(
            summary = "팔로잉 게시판 조회",
            description = "현재 로그인한 사용자가 팔로우한 유저들의 게시글 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "팔로우한 사용자가 없거나 게시글 없음")
            }
    )
    public ResponseEntity<List<PostResponseDto>> getPostsByFollowing(
            @Parameter(description = "유저 ID", required = true) @PathVariable Long userId) {
        List<PostResponseDto> posts = postService.getPostsByFollowing(userId);
        return ResponseEntity.ok(posts);
    }

    // 게시글 1개 READ(상세보기)
    @Operation(
            summary = "게시글 상세보기",
            description = "게시글 ID를 통해 특정 게시글을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId){
        PostResponseDto post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }


    // UPDATE
    // 게시글 UPDATE(수정)
    @Operation(
            summary = "게시글 수정",
            description = "게시글 ID와 수정할 내용을 입력하여 게시글을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "수정 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 (내용 누락 등)"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @PatchMapping("/{postId}")  // 인라인 수정방식(부분 수정 위해)
    public ResponseEntity<PostResponseDto> updatePost(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId,
            @Valid @RequestBody PostPatchRequestDto postPatchRequestDto){
        PostResponseDto responseDto = postService.updatePost(postId, postPatchRequestDto);
        return ResponseEntity.ok(responseDto);
    }


    // DELETE
    // 게시글 DELETE
    @Operation(
            summary = "게시글 삭제",
            description = "게시글 ID를 통해 특정 게시글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "삭제 성공"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId){
        postService.deletePost(postId);
        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }





    //게시글 검색_부가기능



}