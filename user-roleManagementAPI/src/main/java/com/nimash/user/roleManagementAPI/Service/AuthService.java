package com.nimash.user.roleManagementAPI.Service;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Entity.Role;
import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Repository.UserRepository;
import com.nimash.user.roleManagementAPI.Repository.RoleRepository;
import com.nimash.user.roleManagementAPI.Repository.BranchRepository;
import org.springframework.stereotype.Service;
import java.util.List;

import com.nimash.user.roleManagementAPI.Dto.*;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    
    public AuthService(UserRepository userRepository, RoleRepository roleRepository, BranchRepository branchRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
    }

    // Firebase integration will be added here

    public AuthResponse registerUser(UserRegistrationRequest request) {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getEmail())
                    .setEmailVerified(true)
                    .setPassword(request.getPassword())
                    .setDisplayName(request.getFirstName() + " " + request.getLastName())
                    .setDisabled(false);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            // You should also save the user to your local database and assign roles here

            return new AuthResponse(null, null, "Firebase", 0L, userRecord.getUid());
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    public AuthResponse authenticateUser(String idToken) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            // You can fetch user details and roles from your database using uid
            return new AuthResponse(idToken, null, "Bearer", 0L, uid);
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Invalid Firebase token: " + e.getMessage());
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        // Firebase does not support refresh tokens in Admin SDK. Handle on frontend.
        throw new UnsupportedOperationException("Firebase token refresh should be handled on the client side.");
    }

    // Firebase user creation and role assignment will be implemented here

    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
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

    public UserProfileResponse updateUserProfile(String userId, UserProfileResponse updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user fields
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }
        if (updateRequest.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updateRequest.getProfilePictureUrl());
        }
        
        userRepository.save(user);
        return getUserProfile(userId);
    }

    public AuthResponse createAdminUser(AdminUserCreationRequest request) {
        try {
            // Create user in Firebase
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getEmail())
                    .setEmailVerified(true)
                    .setPassword(request.getPassword())
                    .setDisplayName(request.getFirstName() + " " + request.getLastName())
                    .setDisabled(false);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            // Get role from database
            Role.Role_Type roleType = Role.Role_Type.valueOf(request.getRole().toUpperCase());
            Role role = roleRepository.findByRole(roleType)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

            // Get branch from database (use Main Branch if not specified)
            Branch branch;
            if (request.getBranchId() != null) {
                branch = branchRepository.findById(request.getBranchId())
                        .orElseThrow(() -> new RuntimeException("Branch not found: " + request.getBranchId()));
            } else {
                branch = branchRepository.findByName("Main Branch")
                        .orElseThrow(() -> new RuntimeException("Default branch not found"));
            }

            // Save user to local database
            User user = new User();
            user.setId(userRecord.getUid());
            user.setUsername(request.getEmail().split("@")[0]); // Use email prefix as username
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setRole(role);
            user.setBranch(branch);
            user.setIsActive(true);
            userRepository.save(user);

            System.out.println("Created " + request.getRole() + " user: " + request.getEmail() + " (" + userRecord.getUid() + ")");

            return new AuthResponse(null, null, "Firebase", 0L, userRecord.getUid());
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Failed to create user in Firebase: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage());
        }
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    // Profile methods can be implemented using Firebase APIs if needed
}