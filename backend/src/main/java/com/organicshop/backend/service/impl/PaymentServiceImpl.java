package com.organicshop.backend.service.impl;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.organicshop.backend.config.OutboundIdentityProperties;
import com.organicshop.backend.config.VnpayProperties;
import com.organicshop.backend.dto.VnpayPaymentRequest;
import com.organicshop.backend.dto.VnpayPaymentResponse;
import com.organicshop.backend.dto.VnpayReturnResponse;
import com.organicshop.backend.entity.Order;
import com.organicshop.backend.entity.OrderStatus;
import com.organicshop.backend.entity.PaymentStatus;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.repository.OrderRepository;
import com.organicshop.backend.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final VnpayProperties vnpayProperties;
    private final OutboundIdentityProperties outboundIdentityProperties;

    @Value("${app.frontend-url:}")
    private String frontendUrl;

    @Override
    @Transactional
    public VnpayPaymentResponse createVnpayPayment(Long userId, VnpayPaymentRequest request, String clientIp) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to you");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Order has already been paid");
        }

        order.setPaymentMethod("VNPAY");
        orderRepository.save(order);

        String txnRef = order.getId().toString();
        String amount = order.getTotalPrice()
                .multiply(BigDecimal.valueOf(100))
                .toBigIntegerExact()
                .toString();

        Map<String, String> params = new java.util.HashMap<>();
        params.put("vnp_Version", vnpayProperties.getVersion());
        params.put("vnp_Command", vnpayProperties.getCommand());
        params.put("vnp_TmnCode", vnpayProperties.getTmnCode());
        params.put("vnp_Amount", amount);
        params.put("vnp_CurrCode", vnpayProperties.getCurrCode());
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang #" + txnRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", request.getLanguage() == null || request.getLanguage().isBlank()
                ? vnpayProperties.getLocale()
                : request.getLanguage());
        params.put("vnp_ReturnUrl", vnpayProperties.getReturnUrl());
        params.put("vnp_IpAddr", normalizeIp(clientIp));
        params.put("vnp_CreateDate", currentVnpayTime(0));
        params.put("vnp_ExpireDate", currentVnpayTime(15));
        if (request.getBankCode() != null && !request.getBankCode().isBlank()) {
            params.put("vnp_BankCode", request.getBankCode());
        }

        String queryString = buildQuery(params, true);
        String secureHash = hmacSha512(vnpayProperties.getHashSecret(), queryString);
        String paymentUrl = vnpayProperties.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        return new VnpayPaymentResponse(order.getId(), txnRef, paymentUrl);
    }

    @Override
    @Transactional
    public VnpayReturnResponse handleVnpayReturn(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        Map<String, String> filteredParams = params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        String expectedHash = hmacSha512(vnpayProperties.getHashSecret(), buildQuery(filteredParams, true));
        if (secureHash == null || !secureHash.equalsIgnoreCase(expectedHash)) {
            throw new BadRequestException("Invalid VNPay checksum");
        }

        String txnRef = params.get("vnp_TxnRef");
        Long orderId = Long.valueOf(txnRef);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        order.setPaymentStatus(success ? PaymentStatus.PAID : PaymentStatus.FAILED);
        if (success && order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.PROCESSING);
        }
        orderRepository.save(order);

        return VnpayReturnResponse.builder()
                .orderId(orderId)
                .transactionRef(txnRef)
                .responseCode(responseCode)
                .transactionStatus(transactionStatus)
                .paymentStatus(order.getPaymentStatus().name())
                .message(success ? "Thanh toan thanh cong" : "Thanh toan that bai")
                .redirectUrl(buildFrontendPaymentResultUrl(orderId, success, responseCode, transactionStatus))
                .build();
    }

    private String currentVnpayTime(int plusMinutes) {
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        calendar.add(Calendar.MINUTE, plusMinutes);
        return new SimpleDateFormat("yyyyMMddHHmmss").format(calendar.getTime());
    }

    private String normalizeIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank() || clientIp.contains(":")) {
            return "127.0.0.1";
        }
        return clientIp;
    }

    private String buildFrontendPaymentResultUrl(Long orderId, boolean success, String responseCode, String transactionStatus) {
        String baseUrl = frontendUrl;
        if (baseUrl == null || baseUrl.isBlank()) {
            String redirectUri = outboundIdentityProperties.getRedirectUri();
            int pathStart = redirectUri.indexOf('/', redirectUri.indexOf("//") + 2);
            baseUrl = pathStart > 0 ? redirectUri.substring(0, pathStart) : redirectUri;
        }
        return baseUrl + "/payment-result?orderId=" + orderId
                + "&status=" + (success ? "success" : "failed")
                + "&responseCode=" + encode(responseCode == null ? "" : responseCode)
                + "&transactionStatus=" + encode(transactionStatus == null ? "" : transactionStatus);
    }

    private String buildQuery(Map<String, String> params, boolean encodeValues) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder builder = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue == null || fieldValue.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append('&');
            }
            builder.append(encode(fieldName));
            builder.append('=');
            builder.append(encodeValues ? encode(fieldValue) : fieldValue);
        }
        return builder.toString();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(bytes.length * 2);
            for (byte current : bytes) {
                hash.append(String.format("%02x", current & 0xff));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new BadRequestException("Cannot create VNPay signature");
        }
    }
}
