package com.organicshop.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String thumbnail;
}
