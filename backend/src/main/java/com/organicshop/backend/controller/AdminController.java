package com.organicshop.backend.controller;

import com.organicshop.backend.dto.AdminDashboardDTO;
import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.InventoryAdjustmentRequest;
import com.organicshop.backend.dto.InventoryMovementDTO;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.AdminService;
import com.organicshop.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard fetched", adminService.getDashboard()));
    }

    @GetMapping("/inventory-movements")
    public ResponseEntity<ApiResponse<Page<InventoryMovementDTO>>> getInventoryMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory movements fetched",
                inventoryService.getMovements(PageRequest.of(page, size))
        ));
    }

    @PostMapping("/inventory-movements")
    public ResponseEntity<ApiResponse<InventoryMovementDTO>> adjustInventory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody InventoryAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory updated",
                inventoryService.adjustStock(userDetails.getId(), request)
        ));
    }
}
