package com.organicshop.backend.repository;

import com.organicshop.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductId(Long productId, Pageable pageable);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
