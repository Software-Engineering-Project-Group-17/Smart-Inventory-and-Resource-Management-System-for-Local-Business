package com.nimash.user.roleManagementAPI.Service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.nimash.user.roleManagementAPI.Dto.UserProfileResponse;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    public List<UserProfileResponse> getUsersByRole(String roleName) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().name().equals(roleName))
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    public void deactivateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);

        // Also disable in Firebase
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(userId)
                    .setDisabled(true);
            FirebaseAuth.getInstance().updateUser(request);
        } catch (Exception e) {
            log.error("Failed to deactivate user in Firebase: ", e);
        }
    }

    public void activateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(true);
        userRepository.save(user);

        // Also enable in Firebase
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(userId)
                    .setDisabled(false);
            FirebaseAuth.getInstance().updateUser(request);
        } catch (Exception e) {
            log.error("Failed to activate user in Firebase: ", e);
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