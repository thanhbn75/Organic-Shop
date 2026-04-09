package com.organicshop.backend.config;

import com.organicshop.backend.entity.Role;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class InitialApp {

    @Bean
    CommandLineRunner initDefaultAccounts(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    "admin@organicshop.com",
                    "Admin@123",
                    "Organic Shop Admin",
                    "0123456789",
                    Role.ROLE_ADMIN
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    "user@organicshop.com",
                    "User@123",
                    "Organic Shop User",
                    "0987654321",
                    Role.ROLE_USER
            );
        };
    }

    private void createUserIfNotExists(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String rawPassword,
            String fullName,
            String phone,
            Role role
    ) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .phone(phone)
                .role(role)
                .build();

        userRepository.save(user);
    }
}
