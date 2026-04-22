package com.organicshop.backend.service;

import com.organicshop.backend.dto.AuthResponse;
import com.organicshop.backend.dto.LoginRequest;
import com.organicshop.backend.dto.RegisterRequest;
import com.organicshop.backend.dto.GoogleLoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    void register(RegisterRequest registerRequest);
    AuthResponse googleLogin(GoogleLoginRequest request);
}
