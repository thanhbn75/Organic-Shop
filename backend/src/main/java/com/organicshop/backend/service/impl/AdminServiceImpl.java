package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.AdminDashboardDTO;
import com.organicshop.backend.dto.OrderDTO;
import com.organicshop.backend.dto.ProductDTO;
import com.organicshop.backend.dto.UserDTO;
import com.organicshop.backend.entity.Order;
import com.organicshop.backend.entity.OrderStatus;
import com.organicshop.backend.entity.PaymentStatus;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.mapper.ProductMapper;
import com.organicshop.backend.repository.InventoryMovementRepository;
import com.organicshop.backend.repository.OrderRepository;
import com.organicshop.backend.repository.ProductRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private ProductMapper productMapper;

    @Override
    public AdminDashboardDTO getDashboard() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        List<User> latestUsers = userRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<Order> recentOrders = orderRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<com.organicshop.backend.entity.Product> activeProducts = productRepository.findAll().stream()
                .filter(product -> !product.isDeleted())
                .toList();
        List<ProductDTO> lowStockItems = activeProducts.stream()
                .filter(product -> product.getStock() <= 10)
                .limit(6)
                .map(productMapper::toDto)
                .toList();

        dto.setTotalUsers(userRepository.count());
        dto.setTotalProducts(activeProducts.size());
        dto.setTotalOrders(orderRepository.count());
        dto.setPendingOrders(orderRepository.findAll().stream()
                .filter(order -> order.getOrderStatus() == OrderStatus.PENDING || order.getOrderStatus() == OrderStatus.PROCESSING)
                .count());
        dto.setLowStockProducts(activeProducts.stream().filter(product -> product.getStock() <= 10).count());
        dto.setTotalRevenue(orderRepository.findAll().stream()
                .filter(order -> order.getOrderStatus() != OrderStatus.CANCELLED)
                .filter(order -> order.getPaymentStatus() == PaymentStatus.PAID || "COD".equalsIgnoreCase(order.getPaymentMethod()))
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setLatestUsers(latestUsers.stream().map(this::toUserDto).toList());
        dto.setRecentOrders(recentOrders.stream().map(this::toOrderDto).toList());
        dto.setLowStockItems(lowStockItems);
        dto.setRecentInventoryMovements(
                inventoryMovementRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8))
                        .map(movement -> {
                            var item = new com.organicshop.backend.dto.InventoryMovementDTO();
                            item.setId(movement.getId());
                            item.setProductId(movement.getProduct().getId());
                            item.setProductName(movement.getProduct().getName());
                            item.setType(movement.getType().name());
                            item.setQuantityChange(movement.getQuantityChange());
                            item.setQuantityBefore(movement.getQuantityBefore());
                            item.setQuantityAfter(movement.getQuantityAfter());
                            item.setReferenceType(movement.getReferenceType());
                            item.setReferenceId(movement.getReferenceId());
                            item.setNote(movement.getNote());
                            item.setCreatedByName(movement.getCreatedBy() != null ? movement.getCreatedBy().getFullName() : null);
                            item.setCreatedAt(movement.getCreatedAt());
                            return item;
                        }).getContent()
        );
        return dto;
    }

    private UserDTO toUserDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setLocked(user.isLocked());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private OrderDTO toOrderDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}
