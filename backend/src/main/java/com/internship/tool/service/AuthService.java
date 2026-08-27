package com.internship.tool.service;

import com.internship.tool.dto.AuthDtos;
import com.internship.tool.entity.AppUser;
import com.internship.tool.exception.BadRequestException;
import com.internship.tool.repository.AppUserRepository;
import com.internship.tool.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(AppUserRepository users, PasswordEncoder encoder, JwtUtil jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        var user = users.findByUsername(req.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.isEnabled() || !encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        String token = jwt.generate(user.getUsername(), user.getRole());
        return AuthDtos.AuthResponse.builder()
                .token(token).username(user.getUsername())
                .role(user.getRole()).expiresInMs(jwt.getExpirationMs())
                .build();
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        if (users.existsByUsername(req.getUsername())) throw new BadRequestException("Username taken");
        if (users.existsByEmail(req.getEmail()))       throw new BadRequestException("Email taken");
        var u = AppUser.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword()))
                .role("USER")
                .enabled(true)
                .build();
        users.save(u);
        String token = jwt.generate(u.getUsername(), u.getRole());
        return AuthDtos.AuthResponse.builder()
                .token(token).username(u.getUsername())
                .role(u.getRole()).expiresInMs(jwt.getExpirationMs())
                .build();
    }
}
