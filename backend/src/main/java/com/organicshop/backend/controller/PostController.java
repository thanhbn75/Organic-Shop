package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.PostDTO;
import com.organicshop.backend.dto.PostRequest;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PostDTO> posts = postService.getAllPosts(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Posts fetched", posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> getPostById(@PathVariable Long id) {
        PostDTO post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success("Post fetched", post));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<PostDTO>> createPost(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody PostRequest request) {
        PostDTO post = postService.createPost(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Post created", post));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        PostDTO post = postService.updatePost(id, request);
        return ResponseEntity.ok(ApiResponse.success("Post updated", post));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted", null));
    }
}
