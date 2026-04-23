package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.OrderDTO;
import com.organicshop.backend.dto.OrderDetailDTO;
import com.organicshop.backend.dto.OrderRequest;
import com.organicshop.backend.entity.*;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.repository.CartRepository;
import com.organicshop.backend.repository.OrderRepository;
import com.organicshop.backend.repository.ProductRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.InventoryService;
import com.organicshop.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    com.organicshop.backend.service.MailService mailService;

    @Autowired
    InventoryService inventoryService;

    @Override
    public OrderDTO createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();
        record PendingMovement(Product product, Integer quantity, Integer before, Integer after) {}
        List<PendingMovement> pendingMovements = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Not enough stock for product " + product.getName());
            }

            int before = product.getStock();
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
            pendingMovements.add(new PendingMovement(product, item.getQuantity(), before, product.getStock()));

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(product.getPrice());
            
            details.add(detail);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        order.setOrderDetails(details);
        order.setTotalPrice(total);

        Order savedOrder = orderRepository.save(order);
        for (PendingMovement movement : pendingMovements) {
            inventoryService.recordMovement(
                    movement.product(),
                    user,
                    InventoryMovementType.ORDER,
                    -movement.quantity(),
                    movement.before(),
                    movement.after(),
                    "ORDER",
                    savedOrder.getId(),
                    "Stock deducted after order placement"
            );
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        try {
            mailService.sendOrderConfirmation(
                user.getEmail(), 
                user.getFullName(), 
                savedOrder.getId(), 
                savedOrder.getTotalPrice().toString()
            );
        } catch (Exception e) {
            // Log exception, don't fail the order just because mail failed
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return mapToDTO(savedOrder);
    }

    @Override
    public OrderDTO getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to you");
        }
        return mapToDTO(order);
    }

    @Override
    public Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    @Override
    public OrderDTO cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to you");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Can only cancel pending orders");
        }

        // Restore stock
        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = detail.getProduct();
            int before = product.getStock();
            product.setStock(product.getStock() + detail.getQuantity());
            productRepository.save(product);
            inventoryService.recordMovement(
                    product,
                    userRepository.findById(userId).orElse(null),
                    InventoryMovementType.CANCELLATION,
                    detail.getQuantity(),
                    before,
                    product.getStock(),
                    "ORDER_CANCEL",
                    order.getId(),
                    "Stock restored after order cancellation"
            );
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return mapToDTO(updated);
    }

    @Override
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        try {
            order.setOrderStatus(OrderStatus.valueOf(status.toUpperCase()));
            Order updated = orderRepository.save(order);
            return mapToDTO(updated);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status");
        }
    }

    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderDetailDTO> detailDTOs = new ArrayList<>();
        for (OrderDetail detail : order.getOrderDetails()) {
            OrderDetailDTO d = new OrderDetailDTO();
            d.setId(detail.getId());
            d.setProductId(detail.getProduct().getId());
            d.setProductName(detail.getProduct().getName());
            d.setProductImageUrl(detail.getProduct().getImageUrl());
            d.setQuantity(detail.getQuantity());
            d.setPrice(detail.getPrice());
            detailDTOs.add(d);
        }
        dto.setItems(detailDTOs);
        return dto;
    }
}
