package com.organicshop.backend.repository;

import com.organicshop.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByIsDeletedFalse(Pageable pageable);
    Page<Product> findByCategoryIdAndIsDeletedFalse(Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
}
