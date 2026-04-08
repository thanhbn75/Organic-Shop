package com.organicshop.backend.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private java.math.BigDecimal productPrice;
    private Integer quantity;
}
