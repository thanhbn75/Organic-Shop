package com.organicshop.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private boolean locked;
    private LocalDateTime createdAt;
}
