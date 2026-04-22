package com.organicshop.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VnpayReturnResponse {
    private Long orderId;
    private String transactionRef;
    private String responseCode;
    private String transactionStatus;
    private String paymentStatus;
    private String message;
    private String redirectUrl;
}
