package com.nimash.user.roleManagementAPI.Config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

        // First try to get DATABASE_URL (for Choreo deployment)
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null) {
            databaseUrl = dotenv.get("DATABASE_URL");
        }

        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            System.out.println("🔗 Using DATABASE_URL for connection");
            
            // Convert postgresql:// to jdbc:postgresql:// if needed
            if (databaseUrl.startsWith("postgresql://")) {
                databaseUrl = "jdbc:" + databaseUrl;
            }
            
            // Parse the DATABASE_URL to extract components if it contains credentials
            if (databaseUrl.contains("@")) {
                try {
                    // Format: jdbc:postgresql://username:password@host:port/database?params
                    String[] urlParts = databaseUrl.split("://");
                    String protocol = urlParts[0];
                    String remaining = urlParts[1];
                    
                    String[] hostParts = remaining.split("@");
                    String[] credentials = hostParts[0].split(":");
                    String username = credentials[0];
                    String password = credentials[1];
                    String hostAndDb = hostParts[1];
                    
                    // Remove channel_binding=require which can cause issues
                    hostAndDb = hostAndDb.replace("&channel_binding=require", "");
                    hostAndDb = hostAndDb.replace("channel_binding=require&", "");
                    hostAndDb = hostAndDb.replace("channel_binding=require", "");
                    
                    String cleanUrl = protocol + "://" + hostAndDb;
                    
                    System.out.println("🔗 Parsed database connection: " + cleanUrl.replaceAll("\\?.*", ""));
                    
                    return DataSourceBuilder.create()
                        .driverClassName("org.postgresql.Driver")
                        .url(cleanUrl)
                        .username(username)
                        .password(password)
                        .build();
                } catch (Exception e) {
                    System.err.println("❌ Error parsing DATABASE_URL: " + e.getMessage());
                    // Fall through to fallback method
                }
            } else {
                return DataSourceBuilder.create()
                    .driverClassName("org.postgresql.Driver")
                    .url(databaseUrl)
                    .build();
            }
        }

        // Fallback to individual environment variables (for local development)
        String host = dotenv.get("DB_HOST", "localhost");
        String port = dotenv.get("DB_PORT", "5432");
        String dbName = dotenv.get("DB_NAME", "inventory");
        String username = dotenv.get("DB_USERNAME", "postgres");
        String password = dotenv.get("DB_PASSWORD", "password");

        String url = String.format("jdbc:postgresql://%s:%s/%s?sslmode=require", host, port, dbName);
        
        System.out.println("🔗 Connecting to database: " + host + ":" + port + "/" + dbName);
        
        return DataSourceBuilder.create()
            .driverClassName("org.postgresql.Driver")
            .url(url)
            .username(username)
            .password(password)
            .build();
    }
}