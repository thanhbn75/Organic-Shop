package com.organicshop.backend.service;

import com.organicshop.backend.dto.OrderDTO;
import com.organicshop.backend.dto.OrderRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDTO createOrder(Long userId, OrderRequest request);
    OrderDTO getOrderById(Long userId, Long orderId);
    Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable);
    OrderDTO cancelOrder(Long userId, Long orderId);
    
    // Admin ops
    Page<OrderDTO> getAllOrders(Pageable pageable);
    OrderDTO updateOrderStatus(Long orderId, String status);
}
