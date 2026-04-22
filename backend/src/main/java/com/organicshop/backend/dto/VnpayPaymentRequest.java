package com.organicshop.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VnpayPaymentRequest {
    @NotNull
    private Long orderId;
    private String bankCode;
    private String language;
}
