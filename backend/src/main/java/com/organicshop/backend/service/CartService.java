package com.organicshop.backend.service;

import com.organicshop.backend.dto.CartDTO;
import com.organicshop.backend.dto.CartItemRequest;

public interface CartService {
    CartDTO getCartByUserId(Long userId);
    CartDTO addItemToCart(Long userId, CartItemRequest request);
    CartDTO updateItemQuantity(Long userId, Long itemId, Integer quantity);
    CartDTO removeItemFromCart(Long userId, Long itemId);
    void clearCart(Long userId);
}
