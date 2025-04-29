package com.dd.blog.domain.post.post.controller;

import com.dd.blog.domain.post.post.dto.PostPatchRequestDto;
import com.dd.blog.domain.post.post.dto.PostRequestDto;
import com.dd.blog.domain.post.post.dto.PostResponseDto;
import com.dd.blog.domain.post.post.service.PostService;
import com.dd.blog.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
                    @ApiResponse(responseCode = "403", description = "게시글 작성 제한 초과"),
                    @ApiResponse(responseCode = "404", description = "해당 카테고리 없음")
            }
    )
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostResponseDto> createPost(
            @RequestPart("postRequestDto") @Valid PostRequestDto postRequestDto,
            @RequestPart(value = "postImage", required = false) MultipartFile[] postImage,
            @AuthenticationPrincipal SecurityUser user
    ) throws IOException {
        PostResponseDto responseDto = postService.createPost(
                postRequestDto.getCategoryId(),
                user.getId(),
                postRequestDto,
                postImage
        );
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
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<PostResponseDto>> getPostsByCategory(
            @Parameter(description = "카테고리 ID", required = true) @PathVariable Long categoryId){
        List<PostResponseDto> posts = postService.getPostsByCategory(categoryId);
        return ResponseEntity.ok(posts);
    }

    // 팔로잉 대상 게시판 READ
    @Operation(
            summary = "팔로잉 게시판 조회",
            description = "현재 로그인한 사용자가 팔로우한 유저들의 게시글 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "팔로우한 사용자가 없거나 게시글 없음")
            }
    )
    @GetMapping("/following/{userId}")
    public ResponseEntity<List<PostResponseDto>> getPostsByFollowing(
            @Parameter(description = "유저 ID", required = true) @PathVariable Long userId) {
        List<PostResponseDto> posts = postService.getPostsByFollowing(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/following/{userId}/pageable")
    @Operation(
            summary = "팔로잉 게시판 페이지 조회",
            description = "페이지를 적용하여 현재 로그인한 사용자가 팔로우한 유저들의 게시글 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "팔로우한 사용자가 없거나 게시글 없음")
            }
    )
    public ResponseEntity<Page<PostResponseDto>> getPostsByFollowingPageable(
            @Parameter(description = "유저 ID", required = true) @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Page<PostResponseDto> posts = postService.getPostsByFollowingPageable(userId, page, size, sortField, direction);
        return ResponseEntity.ok(posts);
    }

    // 게시글 페이지 조회
    @GetMapping("/pageable")
    @Operation(
            summary = "게시글 페이지 조회",
            description = "페이지를 적용하여 게시글을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공")
            }
    )
    public ResponseEntity<Page<PostResponseDto>> getPostsByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Page<PostResponseDto> posts;
        if (categoryId != null) {
            posts = postService.getPostsByCategoryPageable(categoryId, page, size, sortField, direction);
        } else {
            posts = postService.getAllPostsPageable(page, size, sortField, direction);
        }
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "사용자 게시글 목록 조회",
            description = "특정 사용자가 작성한 게시글 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공"),
                    @ApiResponse(responseCode = "404", description = "사용자가 없거나 게시글이 없음")
            }
    )
    public ResponseEntity<List<PostResponseDto>> getPostsByUser(
            @Parameter(description = "유저 ID", required = true) @PathVariable Long userId) {
        List<PostResponseDto> posts = postService.getPostsByUser(userId);
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
            @Valid @RequestPart PostPatchRequestDto postPatchRequestDto,
            @RequestPart(value = "postImage", required = false) MultipartFile[] postImage) throws IOException {
        PostResponseDto responseDto = postService.updatePost(postId, postPatchRequestDto, postImage);
        return ResponseEntity.ok(responseDto);
    }


    // DELETE
    // 게시글 DELETE
    @Operation(
            summary = "게시글 삭제",
            description = "게시글 ID를 통해 특정 게시글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "삭제 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "403", description = "권한이 없는 사용자"),
                    @ApiResponse(responseCode = "404", description = "해당 게시글 없음")
            }
    )
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId,
            @AuthenticationPrincipal SecurityUser user) {
        postService.deletePost(postId, user.getId());
        return ResponseEntity.noContent().build();
    }


    // SEARCH
    // 게시글 SEARCH
    @Operation(
            summary = "게시글 검색", // Swagger 문서 요약
            description = "제목 또는 작성자 기준으로 게시글을 검색합니다. type=title 또는 type=writer" // Swagger 설명
    )
    @GetMapping("/search")
    public ResponseEntity<Page<PostResponseDto>> searchPosts(
            @RequestParam String type,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Page<PostResponseDto> posts = postService.searchPostsPageable(type, keyword, page, size, sortField, direction);
        return ResponseEntity.ok(posts);
    }

}