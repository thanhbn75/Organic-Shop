package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.PostDTO;
import com.organicshop.backend.dto.PostRequest;
import com.organicshop.backend.entity.Post;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.repository.PostRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @CacheEvict(value = {"posts", "post"}, allEntries = true)
    public PostDTO createPost(Long authorId, PostRequest request) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .thumbnail(request.getThumbnail())
                .author(author)
                .build();

        Post saved = postRepository.save(post);
        return mapToDTO(saved);
    }

    @Override
    @CacheEvict(value = {"posts", "post"}, allEntries = true)
    public PostDTO updatePost(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setThumbnail(request.getThumbnail());

        Post saved = postRepository.save(post);
        return mapToDTO(saved);
    }

    @Override
    @CacheEvict(value = {"posts", "post"}, allEntries = true)
    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "post", key = "#id")
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToDTO(post);
    }

    @Override
    @Cacheable(value = "posts", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(this::mapToDTO);
    }

    private PostDTO mapToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setThumbnail(post.getThumbnail());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setAuthorName(post.getAuthor().getFullName());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        return dto;
    }
}
