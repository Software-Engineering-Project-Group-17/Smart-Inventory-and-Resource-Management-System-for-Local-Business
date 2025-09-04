package com.nimash.user.roleManagementAPI.Config; // use lowercase 'config' by convention

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initFirebase() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return; // already initialized (useful in dev/reload)
            }

            ClassPathResource res = new ClassPathResource("firebase-service-account.json");
            try (InputStream in = res.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(in))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized from classpath resource {}", res.getPath());
            }
        } catch (Exception e) {
            // Don’t fail startup; just log
            log.warn("Firebase initialization failed: {}", e.getMessage());
        }
    }
}