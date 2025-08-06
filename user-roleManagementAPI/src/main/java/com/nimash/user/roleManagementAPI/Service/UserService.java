package com.nimash.user.roleManagementAPI.Service;

import com.nimash.user.roleManagementAPI.Dto.UserProfileResponse;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    public List<UserProfileResponse> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    public void deactivateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);

        // Also disable in Keycloak
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            org.keycloak.representations.idm.UserRepresentation keycloakUser = userResource.toRepresentation();
            keycloakUser.setEnabled(false);
            userResource.update(keycloakUser);
        } catch (Exception e) {
            log.error("Failed to deactivate user in Keycloak: ", e);
        }
    }

    public void activateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(true);
        userRepository.save(user);

        // Also enable in Keycloak
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            org.keycloak.representations.idm.UserRepresentation keycloakUser = userResource.toRepresentation();
            keycloakUser.setEnabled(true);
            userResource.update(keycloakUser);
        } catch (Exception e) {
            log.error("Failed to activate user in Keycloak: ", e);
        }
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setRole(user.getRole().name());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLoginAt(user.getLastLoginAt());
        return response;
    }
}