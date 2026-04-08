package com.organicshop.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private Long id;
    private Long userId;
    private List<CartItemDTO> items;
    private java.math.BigDecimal totalPrice;
}
