package com.organicshop.backend.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String code;
    private String redirectUri;
    private String idToken;
}
