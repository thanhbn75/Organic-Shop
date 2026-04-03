package com.organicshop.backend.service.impl;

import com.organicshop.backend.dto.AddressDTO;
import com.organicshop.backend.dto.UserDTO;
import com.organicshop.backend.entity.Address;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.exception.ResourceNotFoundException;
import com.organicshop.backend.repository.AddressRepository;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public UserDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }

    @Override
    public UserDTO updateUserProfile(Long userId, UserDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password does not match");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public List<AddressDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AddressDTO addAddress(Long userId, AddressDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Address address = new Address();
        address.setUser(user);
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        
        if (request.isDefault() || addressRepository.findByUserId(userId).isEmpty()) {
            address.setDefault(true);
            // Reset others to false
            List<Address> addresses = addressRepository.findByUserId(userId);
            for (Address a : addresses) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        } else {
            address.setDefault(false);
        }

        Address saved = addressRepository.save(address);
        return mapAddressToDTO(saved);
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to you");
        }
        
        addressRepository.delete(address);
    }

    @Override
    public AddressDTO setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to you");
        }

        List<Address> allUserAddresses = addressRepository.findByUserId(userId);
        for (Address a : allUserAddresses) {
            a.setDefault(a.getId().equals(addressId));
            addressRepository.save(a);
        }

        return mapAddressToDTO(address);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private AddressDTO mapAddressToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setDefault(address.isDefault());
        return dto;
    }
}
