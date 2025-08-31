package com.nimash.user.roleManagementAPI.Config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class DotenvConfig {

    @Autowired
    private ConfigurableEnvironment environment;

    @PostConstruct
    public void loadDotenv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

            // Convert dotenv entries to a Map
            java.util.Map<String, Object> dotenvMap = new java.util.HashMap<>();
            dotenv.entries().forEach(entry -> {
                dotenvMap.put(entry.getKey(), entry.getValue());
            });

            MapPropertySource propertySource = new MapPropertySource("dotenv", dotenvMap);
            environment.getPropertySources().addFirst(propertySource);
            
            System.out.println("✅ Environment variables loaded from .env file");
        } catch (Exception e) {
            System.err.println("⚠️  Could not load .env file: " + e.getMessage());
        }
    }
}
