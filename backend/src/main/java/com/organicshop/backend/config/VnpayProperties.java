package com.organicshop.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payment.vnpay")
public class VnpayProperties {
    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;
    private String version;
    private String command;
    private String currCode;
    private String locale;
}
