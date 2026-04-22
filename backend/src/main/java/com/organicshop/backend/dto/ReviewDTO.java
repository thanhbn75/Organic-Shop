package com.organicshop.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer ratingStar;
    private String comment;
    private LocalDateTime createdAt;
}
