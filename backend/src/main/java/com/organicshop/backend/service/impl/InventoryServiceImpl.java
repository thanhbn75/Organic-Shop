package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.InventoryAdjustmentRequest;
import com.organicshop.backend.dto.InventoryMovementDTO;
import com.organicshop.backend.entity.*;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.repository.InventoryMovementRepository;
import com.organicshop.backend.repository.ProductRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public InventoryMovementDTO adjustStock(Long adminUserId, InventoryAdjustmentRequest request) {
        if (request.getProductId() == null || request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Product and quantity are required");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        User actor = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        InventoryMovementType type;
        try {
            type = InventoryMovementType.valueOf(request.getType().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid inventory movement type");
        }

        int before = product.getStock();
        int delta = switch (type) {
            case IMPORT -> request.getQuantity();
            case EXPORT -> -request.getQuantity();
            case ADJUSTMENT -> request.getQuantity();
            default -> throw new BadRequestException("Only IMPORT, EXPORT, ADJUSTMENT are allowed");
        };
        int after = before + delta;

        if (after < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }

        product.setStock(after);
        productRepository.save(product);

        InventoryMovement movement = inventoryMovementRepository.save(InventoryMovement.builder()
                .product(product)
                .createdBy(actor)
                .type(type)
                .quantityChange(delta)
                .quantityBefore(before)
                .quantityAfter(after)
                .referenceType("ADMIN")
                .referenceId(actor.getId())
                .note(request.getNote())
                .build());

        return toDto(movement);
    }

    @Override
    public Page<InventoryMovementDTO> getMovements(Pageable pageable) {
        return inventoryMovementRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Override
    public void recordMovement(Product product, User actor, InventoryMovementType type, Integer quantityChange,
                               Integer quantityBefore, Integer quantityAfter, String referenceType, Long referenceId, String note) {
        inventoryMovementRepository.save(InventoryMovement.builder()
                .product(product)
                .createdBy(actor)
                .type(type)
                .quantityChange(quantityChange)
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .build());
    }

    private InventoryMovementDTO toDto(InventoryMovement movement) {
        InventoryMovementDTO dto = new InventoryMovementDTO();
        dto.setId(movement.getId());
        dto.setProductId(movement.getProduct().getId());
        dto.setProductName(movement.getProduct().getName());
        dto.setType(movement.getType().name());
        dto.setQuantityChange(movement.getQuantityChange());
        dto.setQuantityBefore(movement.getQuantityBefore());
        dto.setQuantityAfter(movement.getQuantityAfter());
        dto.setReferenceType(movement.getReferenceType());
        dto.setReferenceId(movement.getReferenceId());
        dto.setNote(movement.getNote());
        dto.setCreatedByName(movement.getCreatedBy() != null ? movement.getCreatedBy().getFullName() : null);
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }
}
