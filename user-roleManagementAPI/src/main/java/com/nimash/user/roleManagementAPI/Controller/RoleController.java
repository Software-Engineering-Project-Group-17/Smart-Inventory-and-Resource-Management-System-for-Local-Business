package com.nimash.user.roleManagementAPI.Controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.nimash.user.roleManagementAPI.Dto.CreateOwnerRequest;
import com.nimash.user.roleManagementAPI.Entity.*;
import com.nimash.user.roleManagementAPI.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private OwnerRepository ownerRepository;
    
    @Value("${app.admin.secret-key}")
    private String adminSecretKey;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"healthy\",\"timestamp\":\"" + LocalDateTime.now() + "\"}");
    }

    @GetMapping("/simple")
    public String simple() {
        return "RoleController is working";
    }
    
    /**
     * Create an Owner (Owner role)
     * This endpoint creates the first owner user with a secret key
     */
    @PostMapping("/owner")
    public ResponseEntity<String> createOwner(@RequestBody CreateOwnerRequest request) {
        try {
            // Validate secret key
            if (!adminSecretKey.equals(request.getSecretKey())) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Invalid secret key\",\"status\":\"error\"}");
            }

            // Check if owner role exists
            Optional<Role> ownerRole = roleRepository.findByRole(Role.Role_Type.OWNER);
            if (ownerRole.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Owner role not found\",\"status\":\"error\"}");
            }

            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"User already exists\",\"status\":\"error\"}");
            }

            // Create Firebase user
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getName())
                .setEmailVerified(true);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            // Create User entity using explicit setters
            User user = new User();
            user.setEmail(request.getEmail());
            user.setName(request.getName());
            user.setFirebaseUid(userRecord.getUid());
            user.setRole(ownerRole.get());
            user.setIsActive(true);

            User savedUser = userRepository.save(user);

            // Create Owner entity using custom builder
            Owner owner = Owner.builder()
                .user(savedUser)
                .name(request.getName())
                .build();

            ownerRepository.save(owner);

            return ResponseEntity.ok("{\"message\":\"Owner created successfully\",\"status\":\"success\",\"userId\":" + savedUser.getUserId() + ",\"firebaseUid\":\"" + userRecord.getUid() + "\"}");

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("{\"message\":\"Failed to create owner: " + e.getMessage() + "\",\"status\":\"error\"}");
        }
    }

    /**
     * Get user profile by Firebase UID (for role-based redirection after login)
     */
    @GetMapping("/profile/{firebaseUid}")
    public ResponseEntity<String> getUserProfile(@PathVariable String firebaseUid) {
        try {
            Optional<User> user = userRepository.findByFirebaseUid(firebaseUid);
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User u = user.get();
            String roleType = u.getRole().getRole().name();
            
            // Update last login
            u.setLastLogin(LocalDateTime.now());
            userRepository.save(u);

            return ResponseEntity.ok("{\"firebaseUid\":\"" + u.getFirebaseUid() + 
                "\",\"email\":\"" + u.getEmail() + 
                "\",\"name\":\"" + u.getName() + 
                "\",\"role\":\"" + roleType + 
                "\",\"tempPassword\":" + (u.getTempPassword() != null ? u.getTempPassword() : false) + 
                ",\"status\":\"success\"}");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"message\":\"Failed to get profile: " + e.getMessage() + "\",\"status\":\"error\"}");
        }
    }
}
