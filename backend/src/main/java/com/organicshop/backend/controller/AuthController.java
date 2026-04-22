package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.AuthResponse;
import com.organicshop.backend.dto.GoogleLoginRequest;
import com.organicshop.backend.dto.LoginRequest;
import com.organicshop.backend.dto.RegisterRequest;
import com.organicshop.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", null));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
    }
}
