package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.PostDTO;
import com.organicshop.backend.dto.PostRequest;
import com.organicshop.backend.exception.BadRequestException;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir:./uploads}")
    String uploadDir;

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
    @PostMapping(value = "/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<PostDTO>> createPostWithImage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Post thumbnail is required");
        }

        PostRequest request = new PostRequest();
        request.setTitle(title);
        request.setContent(content);
        request.setThumbnail(storeFile(file));

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

    private String storeFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID() + extension;
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + fileName;
    }
}
