package com.organicshop.backend.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private String shippingAddress;
    private String paymentMethod; // e.g. "VNPAY", "MOMO", "COD"
}
