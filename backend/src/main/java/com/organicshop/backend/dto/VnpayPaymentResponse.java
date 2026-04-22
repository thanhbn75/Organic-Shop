package com.organicshop.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VnpayPaymentResponse {
    private Long orderId;
    private String transactionRef;
    private String paymentUrl;
}
