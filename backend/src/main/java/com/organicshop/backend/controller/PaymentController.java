package com.organicshop.backend.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.VnpayPaymentRequest;
import com.organicshop.backend.dto.VnpayPaymentResponse;
import com.organicshop.backend.dto.VnpayReturnResponse;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.PaymentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<VnpayPaymentResponse>> createVnpayPayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody VnpayPaymentRequest request,
            HttpServletRequest httpServletRequest) {
        VnpayPaymentResponse response = paymentService.createVnpayPayment(
                userDetails.getId(),
                request,
                extractClientIp(httpServletRequest));
        return ResponseEntity.ok(ApiResponse.success("VNPay payment url created", response));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        VnpayReturnResponse response = paymentService.handleVnpayReturn(params);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(response.getRedirectUrl()))
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
