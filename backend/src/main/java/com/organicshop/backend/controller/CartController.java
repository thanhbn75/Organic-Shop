package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.CartDTO;
import com.organicshop.backend.dto.CartItemRequest;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        CartDTO cart = cartService.getCartByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDTO>> addItemToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CartItemRequest request) {
        CartDTO cart = cartService.addItemToCart(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> updateItemQuantity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        CartDTO cart = cartService.updateItemQuantity(userDetails.getId(), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> removeItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long itemId) {
        CartDTO cart = cartService.removeItemFromCart(userDetails.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
