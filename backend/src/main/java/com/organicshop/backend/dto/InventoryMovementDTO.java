package com.organicshop.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryMovementDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String type;
    private Integer quantityChange;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String referenceType;
    private Long referenceId;
    private String note;
    private String createdByName;
    private LocalDateTime createdAt;
}
