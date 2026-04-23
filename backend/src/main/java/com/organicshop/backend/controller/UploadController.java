package com.organicshop.backend.controller;

import com.organicshop.backend.dto.ApiResponse;
import com.organicshop.backend.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String storedName = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(ApiResponse.success(
                "File uploaded successfully",
                Map.of("path", "/uploads/" + storedName)
        ));
    }
}
