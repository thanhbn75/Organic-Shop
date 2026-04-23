package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.dto.ProductDTO;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    ProductService productService;

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir:./uploads}")
    String uploadDir;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products;
        
        if (keyword != null && !keyword.isEmpty()) {
            products = productService.searchProducts(keyword, pageable);
        } else {
            products = productService.getAllProducts(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Products fetched", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        ProductDTO productDTO = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product fetched", productDTO));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.ok(ApiResponse.success("Product created", createdProduct));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ProductDTO>> createProductWithImage(
            @RequestParam Long categoryId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam java.math.BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Product image is required");
        }

        ProductDTO productDTO = new ProductDTO();
        productDTO.setCategoryId(categoryId);
        productDTO.setName(name);
        productDTO.setDescription(description);
        productDTO.setPrice(price);
        productDTO.setStock(stock);
        productDTO.setImageUrl(storeFile(file));

        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.ok(ApiResponse.success("Product created", createdProduct));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(ApiResponse.success("Product updated", updatedProduct));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    private String storeFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID() + extension;
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + fileName;
    }
}
