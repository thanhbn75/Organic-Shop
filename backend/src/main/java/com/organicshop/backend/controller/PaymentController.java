package com.organicshop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    // Đây là framework chờ sẵn để bạn integrate SDK VNPay / MoMo
    // Cấu hình keys đã được tạo trong application.yaml

    @GetMapping("/vnpay/callback")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> params) {
        // TODO: Validate checksum (vnp_SecureHash) from VNPay params
        // Lấy mã đơn hàng từ vnp_TxnRef
        // Nếu vnp_ResponseCode == "00" thì update Order paymentStatus = PAID
        return ResponseEntity.ok("VNPay Callback Received. Please implement checksum logic here.");
    }

    @PostMapping("/momo/notify")
    public ResponseEntity<String> momoNotify(@RequestBody Map<String, Object> payload) {
        // TODO: Implement MoMo IPN webhooks verify signature
        return ResponseEntity.ok("Received MoMo IPN");
    }
}
