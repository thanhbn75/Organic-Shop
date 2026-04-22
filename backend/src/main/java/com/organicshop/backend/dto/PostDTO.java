package com.organicshop.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String thumbnail;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
