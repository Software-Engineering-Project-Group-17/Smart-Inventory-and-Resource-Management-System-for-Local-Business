package com.project_07.Auth_User_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity; // For WebFlux, if used
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // For MVC (blocking)
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/test").permitAll() // ✅ allow test endpoint without login
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults()); // or your preferred auth

        return http.build();
    }
}
