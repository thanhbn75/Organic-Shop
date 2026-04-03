package com.organicshop.backend.service;

import com.organicshop.backend.dto.AddressDTO;
import com.organicshop.backend.dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO getUserProfile(Long userId);
    UserDTO updateUserProfile(Long userId, UserDTO userDTO);
    void changePassword(Long userId, String oldPassword, String newPassword);
    
    // Address management
    List<AddressDTO> getUserAddresses(Long userId);
    AddressDTO addAddress(Long userId, AddressDTO addressDTO);
    void deleteAddress(Long userId, Long addressId);
    AddressDTO setDefaultAddress(Long userId, Long addressId);
}
