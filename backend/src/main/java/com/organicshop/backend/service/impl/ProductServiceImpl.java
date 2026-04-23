package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.ProductDTO;
import com.organicshop.backend.entity.Category;
import com.organicshop.backend.entity.Product;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.mapper.ProductMapper;
import com.organicshop.backend.repository.CategoryRepository;
import com.organicshop.backend.repository.ProductRepository;
import com.organicshop.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    ProductRepository productRepository;
    
    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    ProductMapper productMapper;

    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByIsDeletedFalse(pageable)
                .map(productMapper::toDto);
    }

    @Override
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable)
                .map(productMapper::toDto);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        if (product.isDeleted()) {
            throw new ResourceNotFoundException("Product not found with id " + id);
        }
        return productMapper.toDto(product);
    }

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        Product product = productMapper.toEntity(productDTO);
        product.setCategory(category);
        product.setDeleted(false);
        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setStock(productDTO.getStock());
        existingProduct.setImageUrl(productDTO.getImageUrl());
        existingProduct.setCategory(category);
        
        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setDeleted(true); // Soft delete
        productRepository.save(product);
    }
}
