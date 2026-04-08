package com.organicshop.backend.dto;

import com.organicshop.backend.entity.OrderStatus;
import com.organicshop.backend.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private String shippingAddress;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private List<OrderDetailDTO> items;
}
