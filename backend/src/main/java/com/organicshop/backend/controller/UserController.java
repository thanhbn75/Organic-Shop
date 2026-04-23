package com.organicshop.backend.controller;

import com.organicshop.backend.dto.AddressDTO;
import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.UserDTO;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UserDTO> users = userService.getAllUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<ApiResponse<Void>> toggleLock(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        userService.toggleAccountLock(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("User lock status toggled", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestParam String role) {
        userService.changeUserRole(userDetails.getId(), id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserDTO profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserDTO request) {
        UserDTO updated = userService.updateUserProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {
        userService.changePassword(userDetails.getId(), request.get("oldPassword"), request.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    // Address Endpoints
    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getAddresses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<AddressDTO> addresses = userService.getUserAddresses(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched", addresses));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody AddressDTO request) {
        AddressDTO address = userService.addAddress(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address added", address));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        userService.deleteAddress(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PutMapping("/me/addresses/{id}/default")
    public ResponseEntity<ApiResponse<AddressDTO>> setDefaultAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        AddressDTO address = userService.setDefaultAddress(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated", address));
    }
}
