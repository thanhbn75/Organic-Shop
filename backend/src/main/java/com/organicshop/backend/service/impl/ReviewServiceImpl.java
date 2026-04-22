package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.ReviewDTO;
import com.organicshop.backend.dto.ReviewRequest;
import com.organicshop.backend.entity.*;
import com.organicshop.backend.repository.*;
import com.organicshop.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Override
    @CacheEvict(value = "productReviews", allEntries = true)
    public ReviewDTO createReview(Long userId, ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has already reviewed
        if (reviewRepository.existsByUserIdAndProductId(userId, product.getId())) {
            throw new RuntimeException("You have already reviewed this product.");
        }

        // Check if user has purchased this product and order is completed
        long count = orderDetailRepository.countByUserIdAndProductIdAndOrderStatus(userId, product.getId(), OrderStatus.COMPLETED);
        if (count == 0) {
            throw new RuntimeException("You must buy the product and complete the order before reviewing it.");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .ratingStar(request.getRatingStar())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDTO(savedReview);
    }

    @Override
    @Cacheable(value = "productReviews", key = "#productId + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ReviewDTO> getReviewsByProductId(Long productId, Pageable pageable) {
        // optionally verify if product exists
        return reviewRepository.findByProductId(productId, pageable).map(this::mapToDTO);
    }

    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFullName());
        dto.setRatingStar(review.getRatingStar());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
