package com.organicshop.backend.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private Long id;
    private String street;
    private String city;
    private boolean isDefault;
}
