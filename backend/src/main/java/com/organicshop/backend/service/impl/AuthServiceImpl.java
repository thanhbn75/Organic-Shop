package com.organicshop.backend.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.organicshop.backend.config.OutboundIdentityProperties;
import com.organicshop.backend.dto.AuthResponse;
import com.organicshop.backend.dto.GoogleLoginRequest;
import com.organicshop.backend.dto.LoginRequest;
import com.organicshop.backend.dto.RegisterRequest;
import com.organicshop.backend.entity.AuthProvider;
import com.organicshop.backend.entity.Role;
import com.organicshop.backend.entity.User;
import com.organicshop.backend.exception.BadRequestException;
import com.organicshop.backend.repository.UserRepository;
import com.organicshop.backend.security.JwtUtils;
import com.organicshop.backend.security.UserDetailsImpl;
import com.organicshop.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final OutboundIdentityProperties outboundIdentityProperties;
    private final RestClient restClient = RestClient.create();

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return new AuthResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getFullName(), roles.get(0));
    }

    @Override
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        userRepository.save(user);
    }

    @Override
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            GoogleProfile profile;
            if (request.getCode() != null && !request.getCode().isBlank()) {
                profile = exchangeAuthorizationCode(request);
            } else if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
                profile = verifyIdToken(request.getIdToken());
            } else {
                throw new BadRequestException("Google code or idToken is required");
            }

            User user = userRepository.findByEmail(profile.email()).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(profile.email());
                user.setFullName(profile.name());
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(profile.providerId());
                user.setRole(Role.ROLE_USER);
            } else {
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(profile.providerId());
                if (user.getFullName() == null || user.getFullName().isBlank()) {
                    user.setFullName(profile.name());
                }
            }
            user = userRepository.save(user);

            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
            String jwt = jwtUtils.generateJwtToken(auth);

            return new AuthResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getFullName(),
                    userDetails.getAuthorities().iterator().next().getAuthority());
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception e) {
            throw new BadRequestException("Google login failed: " + e.getMessage());
        }
    }

    private GoogleProfile exchangeAuthorizationCode(GoogleLoginRequest request) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("code", request.getCode());
        formData.add("client_id", outboundIdentityProperties.getClientId());
        formData.add("client_secret", outboundIdentityProperties.getClientSecret());
        formData.add("redirect_uri", resolveRedirectUri(request));
        formData.add("grant_type", "authorization_code");

        Map<?, ?> tokenResponse = restClient.post()
                .uri(outboundIdentityProperties.getTokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(Map.class);

        String accessToken = readString(tokenResponse, "access_token");
        if (accessToken == null || accessToken.isBlank()) {
            throw new BadRequestException("Cannot get Google access token");
        }

        Map<?, ?> userInfo = restClient.get()
                .uri(outboundIdentityProperties.getUserInfoUri())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        String email = readString(userInfo, "email");
        String name = readString(userInfo, "name");
        String subject = readString(userInfo, "sub");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Google account has no email");
        }
        return new GoogleProfile(email, name, subject);
    }

    private GoogleProfile verifyIdToken(String idTokenValue) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(outboundIdentityProperties.getClientId()))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenValue);
        if (idToken == null) {
            throw new BadRequestException("Invalid Google ID token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        return new GoogleProfile(payload.getEmail(), (String) payload.get("name"), payload.getSubject());
    }

    private String resolveRedirectUri(GoogleLoginRequest request) {
        if (request.getRedirectUri() != null && !request.getRedirectUri().isBlank()) {
            return request.getRedirectUri();
        }
        return outboundIdentityProperties.getRedirectUri();
    }

    private String readString(Map<?, ?> data, String key) {
        Object value = data == null ? null : data.get(key);
        return value == null ? null : value.toString();
    }

    private record GoogleProfile(String email, String name, String providerId) {
    }
}
