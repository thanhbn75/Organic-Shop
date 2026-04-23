package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.ReviewDTO;
import com.organicshop.backend.dto.ReviewRequest;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Create a review
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO>> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReviewRequest request) {
        ReviewDTO review = reviewService.createReview(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted", review));
    }

    // Get reviews by product
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDTO> reviews = reviewService.getReviewsByProductId(productId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", reviews));
    }
}
