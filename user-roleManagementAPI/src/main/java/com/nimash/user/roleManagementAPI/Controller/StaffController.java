package com.nimash.user.roleManagementAPI.Controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.nimash.user.roleManagementAPI.Dto.StaffCreationRequest;
import com.nimash.user.roleManagementAPI.Dto.StaffResponse;
import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Entity.Role;
import com.nimash.user.roleManagementAPI.Entity.Staff;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Repository.BranchRepository;
import com.nimash.user.roleManagementAPI.Repository.StaffRepository;
import com.nimash.user.roleManagementAPI.Repository.UserRepository;
import com.nimash.user.roleManagementAPI.Repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("Staff Controller is working");
    }
    
    @GetMapping("/test/by-manager")
    @Transactional(readOnly = true)
    public ResponseEntity<?> testGetStaffByManager() {
        try {
            // For testing - find any manager user
            Optional<User> managerOptional = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != null && u.getRole().getRole() == Role.Role_Type.BRANCH_MANAGER)
                .findFirst();
                
            if (managerOptional.isEmpty()) {
                return ResponseEntity.ok(Map.of("staff", new ArrayList<>(), "message", "No managers found in database"));
            }
            
            User manager = managerOptional.get();
            
            // Get all staff managed by this manager (with JOIN FETCH to prevent N+1)
            List<Staff> staffList = staffRepository.findByManagerWithDetails(manager);

            // Convert to response DTOs
            List<StaffResponse> responses = new ArrayList<>();
            for (Staff staff : staffList) {
                responses.add(convertToStaffResponse(staff));
            }

            // Return with wrapper format like branches
            Map<String, Object> result = new HashMap<>();
            result.put("staff", responses);
            result.put("manager", manager.getName());
            result.put("managerEmail", manager.getEmail());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching staff: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody StaffCreationRequest staffRequest,
                                       @RequestHeader("Authorization") String token) {
        try {
            String idToken = token.replace("Bearer ", "");
            User manager = null;
            
            // Development/Test mode bypass
            if (idToken.startsWith("test-") || idToken.startsWith("real-manager-token-") || idToken.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
                // For testing - find any manager user or use test data
                Optional<User> managerOptional = userRepository.findAll()
                    .stream()
                    .filter(u -> u.getRole() != null && u.getRole().getRole() == Role.Role_Type.BRANCH_MANAGER)
                    .findFirst();
                    
                if (managerOptional.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No managers found in database for testing");
                }
                
                manager = managerOptional.get();
            } else {
                // Production Firebase token verification
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String firebaseUid = decodedToken.getUid();

                // Check if user exists and is MANAGER
                Optional<User> managerOptional = userRepository.findByFirebaseUid(firebaseUid);
                if (managerOptional.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
                }

                manager = managerOptional.get();
                if (manager.getRole().getRole() != Role.Role_Type.BRANCH_MANAGER) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only managers can create staff");
                }
            }

            // Get manager's branch
            Optional<Branch> managerBranchOptional = branchRepository.findByManager(manager);
            if (managerBranchOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Manager is not assigned to any branch");
            }

            Branch branch = managerBranchOptional.get();

            // Check if branchId in request matches manager's branch (if provided)
            if (staffRequest.getBranchId() != null && !staffRequest.getBranchId().equals(branch.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Manager can only create staff for their own branch");
            }

            // Check if email already exists
            if (staffRepository.existsByEmail(staffRequest.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already exists");
            }

            // Get STAFF role
            Optional<Role> staffRoleOptional = roleRepository.findByRole(Role.Role_Type.STAFF);
            if (staffRoleOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Staff role not found");
            }

            // Create User account for staff
            User staffUser = new User();
            staffUser.setName(staffRequest.getFirstName() + " " + staffRequest.getLastName());
            staffUser.setEmail(staffRequest.getEmail());
            staffUser.setRole(staffRoleOptional.get());
            
            // Note: In a real implementation, you'd create the Firebase user here
            // and get the Firebase UID. For now, we'll use a placeholder.
            staffUser.setFirebaseUid("temp_" + System.currentTimeMillis());
            
            staffUser = userRepository.save(staffUser);

            // Create Staff record
            Staff staff = new Staff();
            staff.setUser(staffUser);
            staff.setFirstName(staffRequest.getFirstName());
            staff.setLastName(staffRequest.getLastName());
            staff.setEmail(staffRequest.getEmail());
            staff.setAddress(staffRequest.getAddress());
            staff.setTel(staffRequest.getTel());
            staff.setSalary(staffRequest.getSalary());
            staff.setStaffTypes(staffRequest.getStaffTypes());
            staff.setBranch(branch);
            staff.setManager(manager);

            staff = staffRepository.save(staff);

            // Create response
            StaffResponse response = new StaffResponse();
            response.setId(staff.getId());
            response.setFirstName(staff.getFirstName());
            response.setLastName(staff.getLastName());
            response.setEmail(staff.getEmail());
            response.setAddress(staff.getAddress());
            response.setTel(staff.getTel());
            response.setSalary(staff.getSalary());
            
            // Convert enum set to string set
            Set<String> staffTypeStrings = new HashSet<>();
            if (staff.getStaffTypes() != null) {
                for (Staff.StaffType type : staff.getStaffTypes()) {
                    staffTypeStrings.add(type.name());
                }
            }
            response.setStaffTypes(staffTypeStrings);
            
            response.setBranchId(branch.getId());
            response.setBranchName(branch.getName());
            response.setManagerId(manager.getUserId());
            response.setManagerName(manager.getName());
            response.setUserFirebaseUid(staffUser.getFirebaseUid());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating staff: " + e.getMessage());
        }
    }

    @GetMapping("/by-manager")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getStaffByManager(@RequestHeader("Authorization") String token) {
        try {
            String idToken = token.replace("Bearer ", "");
            User manager = null;
            
            // Development/Test mode bypass
            if (idToken.startsWith("test-") || idToken.startsWith("real-manager-token-") || idToken.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
                // For testing - find any manager user or use test data
                Optional<User> managerOptional = userRepository.findAll()
                    .stream()
                    .filter(u -> u.getRole() != null && u.getRole().getRole() == Role.Role_Type.BRANCH_MANAGER)
                    .findFirst();
                    
                if (managerOptional.isEmpty()) {
                    return ResponseEntity.ok(Map.of("staff", new ArrayList<>(), "message", "No managers found in database for testing"));
                }
                
                manager = managerOptional.get();
            } else {
                // Production Firebase token verification
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String firebaseUid = decodedToken.getUid();

                // Check if user exists and is MANAGER
                Optional<User> managerOptional = userRepository.findByFirebaseUid(firebaseUid);
                if (managerOptional.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
                }

                manager = managerOptional.get();
                if (manager.getRole().getRole() != Role.Role_Type.BRANCH_MANAGER) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only managers can view their staff");
                }
            }

            // Get all staff managed by this manager (with JOIN FETCH to prevent N+1)
            List<Staff> staffList = staffRepository.findByManagerWithDetails(manager);

            // Convert to response DTOs
            List<StaffResponse> responses = new ArrayList<>();
            for (Staff staff : staffList) {
                responses.add(convertToStaffResponse(staff));
            }

            // Return with wrapper format like branches
            Map<String, Object> result = new HashMap<>();
            result.put("staff", responses);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching staff: " + e.getMessage());
        }
    }

    @GetMapping("/by-branch/{branchId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getStaffByBranch(@PathVariable Long branchId,
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

            User user = userOptional.get();
            
            // Check if branch exists
            Optional<Branch> branchOptional = branchRepository.findById(branchId);
            if (branchOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Branch not found");
            }

            Branch branch = branchOptional.get();

            // Authorization check: Only owners, managers of this branch can view staff
            if (user.getRole().getRole() == Role.Role_Type.OWNER) {
                // Owner can view any branch staff
            } else if (user.getRole().getRole() == Role.Role_Type.BRANCH_MANAGER) {
                // Manager can only view their own branch staff
                Optional<Branch> managerBranchOptional = branchRepository.findByManager(user);
                if (managerBranchOptional.isEmpty() || !managerBranchOptional.get().getId().equals(branchId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Manager can only view staff from their own branch");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Insufficient permissions to view staff");
            }

            // Get all staff in this branch
            // Get all staff in the specified branch (with JOIN FETCH to prevent N+1)
            List<Staff> staffList = staffRepository.findByBranchWithDetails(branch);

            // Convert to response DTOs
            List<StaffResponse> responses = new ArrayList<>();
            for (Staff staff : staffList) {
                responses.add(convertToStaffResponse(staff));
            }

            // Return with wrapper format
            Map<String, Object> result = new HashMap<>();
            result.put("staff", responses);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching staff: " + e.getMessage());
        }
    }

    @GetMapping("/{staffId}")
    public ResponseEntity<?> getStaffById(@PathVariable Long staffId,
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

            User user = userOptional.get();
            
            // Check if staff exists
            Optional<Staff> staffOptional = staffRepository.findById(staffId);
            if (staffOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Staff not found");
            }

            Staff staff = staffOptional.get();

            // Authorization check
            if (user.getRole().getRole() == Role.Role_Type.OWNER) {
                // Owner can view any staff
            } else if (user.getRole().getRole() == Role.Role_Type.BRANCH_MANAGER) {
                // Manager can only view their own staff
                if (!staff.getManager().getUserId().equals(user.getUserId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Manager can only view their own staff");
                }
            } else if (user.getRole().getRole() == Role.Role_Type.STAFF) {
                // Staff can only view their own record
                if (!staff.getUser().getUserId().equals(user.getUserId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Staff can only view their own record");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Insufficient permissions");
            }

            // Create response
            StaffResponse response = new StaffResponse();
            response.setId(staff.getId());
            response.setFirstName(staff.getFirstName());
            response.setLastName(staff.getLastName());
            response.setEmail(staff.getEmail());
            response.setAddress(staff.getAddress());
            response.setTel(staff.getTel());
            response.setSalary(staff.getSalary());
            
            // Convert enum set to string set
            Set<String> staffTypeStrings = new HashSet<>();
            if (staff.getStaffTypes() != null) {
                for (Staff.StaffType type : staff.getStaffTypes()) {
                    staffTypeStrings.add(type.name());
                }
            }
            response.setStaffTypes(staffTypeStrings);
            
            response.setBranchId(staff.getBranch().getId());
            response.setBranchName(staff.getBranch().getName());
            response.setManagerId(staff.getManager().getUserId());
            response.setManagerName(staff.getManager().getName());
            response.setUserFirebaseUid(staff.getUser().getFirebaseUid());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching staff: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to convert Staff entity to StaffResponse DTO
     * This method prevents lazy loading issues by accessing all needed fields within transaction
     */
    private StaffResponse convertToStaffResponse(Staff staff) {
        StaffResponse response = new StaffResponse();
        response.setId(staff.getId());
        response.setFirstName(staff.getFirstName());
        response.setLastName(staff.getLastName());
        response.setEmail(staff.getEmail());
        response.setAddress(staff.getAddress());
        response.setTel(staff.getTel());
        response.setSalary(staff.getSalary());
        
        // Convert enum set to string set
        Set<String> staffTypeStrings = new HashSet<>();
        if (staff.getStaffTypes() != null) {
            for (Staff.StaffType type : staff.getStaffTypes()) {
                staffTypeStrings.add(type.name());
            }
        }
        response.setStaffTypes(staffTypeStrings);
        
        // Access branch details safely
        if (staff.getBranch() != null) {
            response.setBranchId(staff.getBranch().getId());
            response.setBranchName(staff.getBranch().getName());
        }
        
        // Access manager details safely
        if (staff.getManager() != null) {
            response.setManagerId(staff.getManager().getUserId());
            response.setManagerName(staff.getManager().getName());
        }
        
        // Access user details safely
        if (staff.getUser() != null) {
            response.setUserFirebaseUid(staff.getUser().getFirebaseUid());
        }
        
        return response;
    }
}
