package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.CartDTO;
import com.organicshop.backend.dto.CartItemDTO;
import com.organicshop.backend.dto.CartItemRequest;
import com.organicshop.backend.entity.Cart;
import com.organicshop.backend.entity.CartItem;
import com.organicshop.backend.entity.Product;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.repository.CartItemRepository;
import com.organicshop.backend.repository.CartRepository;
import com.organicshop.backend.repository.ProductRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    @Override
    public CartDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDTO(cart);
    }

    @Override
    public CartDTO addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Not enough stock for this product");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            int newQuantity = existingItem.get().getQuantity() + request.getQuantity();
            if (newQuantity > product.getStock()) {
                throw new BadRequestException("Quantity exceeds available stock");
            }
            existingItem.get().setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToDTO(updatedCart);
    }

    @Override
    public CartDTO updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            if (cartItem.getProduct().getStock() < quantity) {
                throw new BadRequestException("Quantity exceeds available stock");
            }
            cartItem.setQuantity(quantity);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToDTO(updatedCart);
    }

    @Override
    public CartDTO removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        Cart updatedCart = cartRepository.save(cart);
        return mapToDTO(updatedCart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    private CartDTO mapToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());

        List<CartItemDTO> itemDTOs = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setProductImageUrl(item.getProduct().getImageUrl());
            itemDTO.setProductPrice(item.getProduct().getPrice());
            itemDTO.setQuantity(item.getQuantity());
            itemDTOs.add(itemDTO);

            total = total.add(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        dto.setItems(itemDTOs);
        dto.setTotalPrice(total);
        return dto;
    }
}
