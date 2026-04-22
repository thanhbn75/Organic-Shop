package com.organicshop.backend.service;

import com.organicshop.backend.dto.PostDTO;
import com.organicshop.backend.dto.PostRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    PostDTO createPost(Long authorId, PostRequest request);
    PostDTO updatePost(Long id, PostRequest request);
    void deletePost(Long id);
    PostDTO getPostById(Long id);
    Page<PostDTO> getAllPosts(Pageable pageable);
}
