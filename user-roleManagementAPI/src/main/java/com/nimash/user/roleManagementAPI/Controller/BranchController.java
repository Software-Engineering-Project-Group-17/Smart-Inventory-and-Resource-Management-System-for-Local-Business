package com.nimash.user.roleManagementAPI.Controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.nimash.user.roleManagementAPI.Dto.BranchRequest;
import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Entity.Role;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Repository.BranchRepository;
import com.nimash.user.roleManagementAPI.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*")
public class BranchController {

    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createBranch(@Valid @RequestBody BranchRequest branchRequest,
                                        @RequestHeader("Authorization") String token) {
        try {
            // Verify Firebase token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            // Check if user exists and is OWNER
            Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
            }

            User user = userOptional.get();
            if (user.getRole().getRole() != Role.Role_Type.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only owners can create branches");
            }

            // Check if branch with same name already exists
            Optional<Branch> existingBranch = branchRepository.findByName(branchRequest.getName());
            if (existingBranch.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Branch with name '" + branchRequest.getName() + "' already exists");
            }

            // Create new branch
            Branch branch = new Branch();
            branch.setName(branchRequest.getName());
            branch.setLocation(branchRequest.getLocation());
            branch.setContactNumber(branchRequest.getContactNumber());
            branch.setDescription(branchRequest.getDescription());
            branch.setStatus(Branch.BranchStatus.ACTIVE);
            branch.setOwner(user); // Set the owner to the current user

            Branch savedBranch = branchRepository.save(branch);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body("Branch created successfully with ID: " + savedBranch.getId());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating branch: " + e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok()
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
            .header("Access-Control-Allow-Headers", "*")
            .header("Access-Control-Allow-Credentials", "true")
            .build();
    }

    @GetMapping
    public ResponseEntity<String> getAllBranches(@RequestHeader("Authorization") String token) {
        try {
            // Verify Firebase token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            // Check if user exists
            Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"error\":\"User not found\"}");
            }

            User user = userOptional.get();
            
            // Get branches owned by this user only
            List<Branch> branches = branchRepository.findByOwner(user);
            
            // Manually build JSON to avoid Hibernate proxy serialization issues
            StringBuilder result = new StringBuilder();
            result.append("{\"branches\":[");
            
            for (int i = 0; i < branches.size(); i++) {
                Branch branch = branches.get(i);
                if (i > 0) result.append(",");
                result.append("{")
                    .append("\"id\":").append(branch.getId()).append(",")
                    .append("\"name\":\"").append(escapeJson(branch.getName())).append("\",")
                    .append("\"location\":\"").append(escapeJson(branch.getLocation() != null ? branch.getLocation() : "")).append("\",")
                    .append("\"contactNumber\":\"").append(escapeJson(branch.getContactNumber() != null ? branch.getContactNumber() : "")).append("\",")
                    .append("\"description\":\"").append(escapeJson(branch.getDescription() != null ? branch.getDescription() : "")).append("\",")
                    .append("\"status\":\"").append(branch.getStatus() != null ? branch.getStatus() : "ACTIVE").append("\",")
                    .append("\"createdAt\":\"").append(branch.getCreatedAt() != null ? branch.getCreatedAt().toString() : "").append("\"");
                
                // Add manager info if exists (safely handle lazy loading)
                if (branch.getManager() != null) {
                    try {
                        User manager = branch.getManager();
                        result.append(",\"manager\":{")
                            .append("\"id\":").append(manager.getUserId()).append(",")
                            .append("\"email\":\"").append(escapeJson(manager.getEmail())).append("\",")
                            .append("\"name\":\"").append(escapeJson(manager.getName())).append("\"")
                            .append("}");
                    } catch (Exception e) {
                        // If lazy loading fails, just indicate manager exists
                        result.append(",\"manager\":{\"id\":null,\"email\":\"Loading...\",\"name\":\"Loading...\"}");
                    }
                } else {
                    result.append(",\"manager\":null");
                }
                
                result.append("}");
            }
            
            result.append("]}");
            return ResponseEntity.ok(result.toString());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBranchById(@PathVariable Long id,
                                         @RequestHeader("Authorization") String token) {
        try {
            // Verify Firebase token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            // Check if user exists
            Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
            }

            Optional<Branch> branchOptional = branchRepository.findById(id);
            if (branchOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Branch not found");
            }

            return ResponseEntity.ok(branchOptional.get());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving branch: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBranch(@PathVariable Long id,
                                        @Valid @RequestBody BranchRequest branchRequest,
                                        @RequestHeader("Authorization") String token) {
        try {
            // Verify Firebase token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            // Check if user exists and is OWNER
            Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
            }

            User user = userOptional.get();
            if (user.getRole().getRole() != Role.Role_Type.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only owners can update branches");
            }

            Optional<Branch> branchOptional = branchRepository.findById(id);
            if (branchOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Branch not found");
            }

            // Check if new name conflicts with existing branches (excluding current branch)
            Optional<Branch> existingBranch = branchRepository.findByName(branchRequest.getName());
            if (existingBranch.isPresent() && !existingBranch.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Branch with name '" + branchRequest.getName() + "' already exists");
            }

            Branch branch = branchOptional.get();
            branch.setName(branchRequest.getName());
            branch.setLocation(branchRequest.getLocation());
            branch.setContactNumber(branchRequest.getContactNumber());
            branch.setDescription(branchRequest.getDescription());

            Branch updatedBranch = branchRepository.save(branch);

            return ResponseEntity.ok("Branch updated successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating branch: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBranch(@PathVariable Long id,
                                        @RequestHeader("Authorization") String token) {
        try {
            // Verify Firebase token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebaseUid = decodedToken.getUid();

            // Check if user exists and is OWNER
            Optional<User> userOptional = userRepository.findByFirebaseUid(firebaseUid);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
            }

            User user = userOptional.get();
            if (user.getRole().getRole() != Role.Role_Type.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only owners can delete branches");
            }

            Optional<Branch> branchOptional = branchRepository.findById(id);
            if (branchOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Branch not found");
            }

            branchRepository.deleteById(id);

            return ResponseEntity.ok("Branch deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting branch: " + e.getMessage());
        }
    }

    // Debug endpoint to see current branches (similar to the one in RoleController)
    @GetMapping("/debug/all")
    public ResponseEntity<?> debugGetAllBranches() {
        try {
            List<Branch> branches = branchRepository.findAll();
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving branches: " + e.getMessage());
        }
    }

    // Debug endpoint to get branches by owner email (for testing)
    @GetMapping("/debug/owner/{email}")
    public ResponseEntity<String> debugGetBranchesByOwner(@PathVariable String email) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\":\"Owner not found with email: " + email + "\"}");
            }

            List<Branch> branches = branchRepository.findByOwner(userOptional.get());
            
            // Manually build JSON to avoid Hibernate proxy serialization issues
            StringBuilder result = new StringBuilder();
            result.append("{\"branches\":[");
            
            for (int i = 0; i < branches.size(); i++) {
                Branch branch = branches.get(i);
                if (i > 0) result.append(",");
                result.append("{")
                    .append("\"id\":").append(branch.getId()).append(",")
                    .append("\"name\":\"").append(escapeJson(branch.getName())).append("\",")
                    .append("\"location\":\"").append(escapeJson(branch.getLocation() != null ? branch.getLocation() : "")).append("\",")
                    .append("\"contactNumber\":\"").append(escapeJson(branch.getContactNumber() != null ? branch.getContactNumber() : "")).append("\",")
                    .append("\"description\":\"").append(escapeJson(branch.getDescription() != null ? branch.getDescription() : "")).append("\",")
                    .append("\"status\":\"").append(branch.getStatus() != null ? branch.getStatus() : "ACTIVE").append("\",")
                    .append("\"createdAt\":\"").append(branch.getCreatedAt() != null ? branch.getCreatedAt().toString() : "").append("\"");
                
                // Add manager info if exists (safely handle lazy loading)
                if (branch.getManager() != null) {
                    try {
                        User manager = branch.getManager();
                        result.append(",\"manager\":{")
                            .append("\"id\":").append(manager.getUserId()).append(",")
                            .append("\"email\":\"").append(escapeJson(manager.getEmail())).append("\",")
                            .append("\"name\":\"").append(escapeJson(manager.getName())).append("\"")
                            .append("}");
                    } catch (Exception e) {
                        // If lazy loading fails, just indicate manager exists
                        result.append(",\"manager\":{\"id\":null,\"email\":\"Loading...\",\"name\":\"Loading...\"}");
                    }
                } else {
                    result.append(",\"manager\":null");
                }
                
                result.append("}");
            }
            
            result.append("]}");
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }
    
    // Helper method to escape JSON strings
    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    // Test endpoint to create branch without Firebase authentication (for testing only)
    @PostMapping("/test/create")
    public ResponseEntity<?> testCreateBranch(@Valid @RequestBody BranchRequest branchRequest,
                                            @RequestParam String ownerEmail) {
        try {
            // Find owner by email (for testing without Firebase token)
            Optional<User> userOptional = userRepository.findByEmail(ownerEmail);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Owner user not found with email: " + ownerEmail);
            }

            User user = userOptional.get();
            if (user.getRole().getRole() != Role.Role_Type.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only owners can create branches. User role: " + user.getRole().getRole());
            }

            // Check if branch with same name already exists
            Optional<Branch> existingBranch = branchRepository.findByName(branchRequest.getName());
            if (existingBranch.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Branch with name '" + branchRequest.getName() + "' already exists");
            }

            // Create new branch
            Branch branch = new Branch();
            branch.setName(branchRequest.getName());
            branch.setLocation(branchRequest.getLocation());
            branch.setContactNumber(branchRequest.getContactNumber());
            branch.setDescription(branchRequest.getDescription());
            branch.setStatus(Branch.BranchStatus.ACTIVE);
            branch.setOwner(user); // Set the owner to the current user

            Branch savedBranch = branchRepository.save(branch);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body("Branch created successfully with ID: " + savedBranch.getId() + 
                      ", Name: " + savedBranch.getName() + 
                      ", Location: " + savedBranch.getLocation());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating branch: " + e.getMessage());
        }
    }
}
