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

        String host = dotenv.get("DB_HOST", "localhost");
        String dbName = dotenv.get("DB_NAME", "inventory");
        String username = dotenv.get("DB_USERNAME", "postgres");
        String password = dotenv.get("DB_PASSWORD", "password");

        String url = "jdbc:postgresql://" + host + "/" + dbName + "?sslmode=require&channel_binding=require";
        
        System.out.println("🔗 Connecting to database: " + host + "/" + dbName);
        
        return DataSourceBuilder.create()
            .driverClassName("org.postgresql.Driver")
            .url(url)
            .username(username)
            .password(password)
            .build();
    }
}
