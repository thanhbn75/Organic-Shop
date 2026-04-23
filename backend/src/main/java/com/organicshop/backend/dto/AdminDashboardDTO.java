package com.organicshop.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminDashboardDTO {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;
    private long lowStockProducts;
    private BigDecimal totalRevenue;
    private List<UserDTO> latestUsers;
    private List<OrderDTO> recentOrders;
    private List<ProductDTO> lowStockItems;
    private List<InventoryMovementDTO> recentInventoryMovements;
}
