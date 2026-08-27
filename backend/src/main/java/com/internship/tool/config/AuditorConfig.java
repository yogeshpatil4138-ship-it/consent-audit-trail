package com.internship.tool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
public class AuditorConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            var ctx = SecurityContextHolder.getContext().getAuthentication();
            if (ctx == null || !ctx.isAuthenticated()) return Optional.of("system");
            return Optional.ofNullable(ctx.getName());
        };
    }
}
