package com.internship.tool.controller;

import com.internship.tool.dto.AuthDtos;
import com.internship.tool.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth")
public class AuthController {

    private final AuthService svc;
    public AuthController(AuthService svc) { this.svc = svc; }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest r) {
        return svc.login(r);
    }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest r) {
        return svc.register(r);
    }
}
