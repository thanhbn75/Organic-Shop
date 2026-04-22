package com.organicshop.backend.service;

import com.organicshop.backend.dto.ReviewDTO;
import com.organicshop.backend.dto.ReviewRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewDTO createReview(Long userId, ReviewRequest request);
    Page<ReviewDTO> getReviewsByProductId(Long productId, Pageable pageable);
}
