package com.organicshop.backend.service;

import java.util.Map;

import com.organicshop.backend.dto.VnpayPaymentRequest;
import com.organicshop.backend.dto.VnpayPaymentResponse;
import com.organicshop.backend.dto.VnpayReturnResponse;

public interface PaymentService {
    VnpayPaymentResponse createVnpayPayment(Long userId, VnpayPaymentRequest request, String clientIp);

    VnpayReturnResponse handleVnpayReturn(Map<String, String> params);
}
