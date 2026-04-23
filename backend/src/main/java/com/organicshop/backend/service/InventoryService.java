package com.organicshop.backend.service;

import com.organicshop.backend.dto.InventoryAdjustmentRequest;
import com.organicshop.backend.dto.InventoryMovementDTO;
import com.organicshop.backend.entity.InventoryMovementType;
import com.organicshop.backend.entity.Product;
import com.organicshop.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryService {
    InventoryMovementDTO adjustStock(Long adminUserId, InventoryAdjustmentRequest request);
    Page<InventoryMovementDTO> getMovements(Pageable pageable);
    void recordMovement(Product product, User actor, InventoryMovementType type, Integer quantityChange,
                        Integer quantityBefore, Integer quantityAfter, String referenceType, Long referenceId, String note);
}
