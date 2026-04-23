package com.organicshop.backend.repository;

import com.organicshop.backend.entity.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    Page<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    Page<InventoryMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
