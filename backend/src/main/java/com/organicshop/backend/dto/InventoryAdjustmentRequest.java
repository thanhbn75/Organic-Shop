package com.organicshop.backend.dto;

import lombok.Data;

@Data
public class InventoryAdjustmentRequest {
    private Long productId;
    private Integer quantity;
    private String type;
    private String note;
}
