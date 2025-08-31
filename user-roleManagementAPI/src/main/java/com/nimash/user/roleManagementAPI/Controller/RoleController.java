package com.nimash.user.roleManagementAPI.Controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.nimash.user.roleManagementAPI.Dto.CreateOwnerRequest;
import com.nimash.user.roleManagementAPI.Dto.CreateManagerRequest;
import com.nimash.user.roleManagementAPI.Dto.CreateStaffRequest;
import com.nimash.user.roleManagementAPI.Entity.*;
import com.nimash.user.roleManagementAPI.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private OwnerRepository ownerRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
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
    
    @GetMapping("/debug/users")
    public ResponseEntity<String> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            StringBuilder result = new StringBuilder();
            result.append("{\"users\":[");
            
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                if (i > 0) result.append(",");
                result.append("{")
                    .append("\"id\":").append(user.getUserId()).append(",")
                    .append("\"email\":\"").append(user.getEmail()).append("\",")
                    .append("\"name\":\"").append(user.getName()).append("\",")
                    .append("\"firebaseUid\":\"").append(user.getFirebaseUid()).append("\",")
                    .append("\"role\":\"").append(user.getRole().getRole().name()).append("\"")
                    .append("}");
            }
            
            result.append("]}");
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping("/debug/branches")
    public ResponseEntity<String> getAllBranches() {
        try {
            List<Branch> branches = branchRepository.findAll();
            StringBuilder result = new StringBuilder();
            result.append("{\"branches\":[");
            
            for (int i = 0; i < branches.size(); i++) {
                Branch branch = branches.get(i);
                if (i > 0) result.append(",");
                result.append("{")
                    .append("\"id\":").append(branch.getId()).append(",")
                    .append("\"name\":\"").append(branch.getName()).append("\",")
                    .append("\"location\":\"").append(branch.getLocation() != null ? branch.getLocation() : "").append("\"")
                    .append("}");
            }
            
            result.append("]}");
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
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
     * Owner creates a Branch Manager
     * Only owners can create branch managers
     */
    @PostMapping("/manager")
    public ResponseEntity<String> createManager(@RequestBody CreateManagerRequest request) {
        try {
            // Validate that the creator is an owner
            Optional<User> ownerUser = userRepository.findByFirebaseUid(request.getCreatorFirebaseUid());
            if (ownerUser.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Creator not found\",\"status\":\"error\"}");
            }
            
            // Check if creator is owner
            if (!ownerUser.get().getRole().getRole().equals(Role.Role_Type.OWNER)) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Only owners can create managers\",\"status\":\"error\"}");
            }

            // Validate branch exists
            Optional<Branch> branch = branchRepository.findById(request.getBranchId());
            if (branch.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Branch not found\",\"status\":\"error\"}");
            }

            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Email already exists\",\"status\":\"error\"}");
            }

            // Create Firebase user
            UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getFirstName() + " " + request.getLastName())
                .setEmailVerified(false);

            UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(firebaseRequest);

            // Get manager role
            Role managerRole = roleRepository.findByRole(Role.Role_Type.BRANCH_MANAGER)
                .orElseThrow(() -> new RuntimeException("Manager role not found"));

            // Create User entity using explicit setters
            User user = new User();
            user.setFirebaseUid(firebaseUser.getUid());
            user.setEmail(request.getEmail());
            user.setName(request.getFirstName() + " " + request.getLastName());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole(managerRole);
            user.setIsActive(true);

            User savedUser = userRepository.save(user);

            // Update branch with manager using explicit setter
            Branch updatedBranch = branch.get();
            updatedBranch.setManager(savedUser);
            branchRepository.save(updatedBranch);

            // Create Staff entry for the manager using explicit setters
            Staff managerStaff = new Staff();
            managerStaff.setUser(savedUser);
            managerStaff.setFirstName(request.getFirstName());
            managerStaff.setLastName(request.getLastName());
            managerStaff.setEmail(request.getEmail());
            managerStaff.setAddress(request.getAddress());
            managerStaff.setTel(request.getPhoneNumber());
            managerStaff.setBranch(updatedBranch);
            managerStaff.setManager(null); // Manager doesn't have a manager
            
            // Set new fields for updated schema
            managerStaff.setSalary(new java.math.BigDecimal("0.00")); // Default salary for manager
            managerStaff.setStaffTypes(Set.of("SALES", "INVENTORY", "RESOURCES")); // Manager has all permissions
            managerStaff.setHireDate(java.time.LocalDateTime.now());
            managerStaff.setIsActive(true);

            staffRepository.save(managerStaff);

            return ResponseEntity.ok("{\"message\":\"Manager created successfully\",\"status\":\"success\",\"firebaseUid\":\"" + firebaseUser.getUid() + "\"}");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"message\":\"Failed to create manager: " + e.getMessage() + "\",\"status\":\"error\"}");
        }
    }

    /**
     * Branch Manager creates Staff
     * Only branch managers can create staff in their branch
     */
    @PostMapping("/staff")
    public ResponseEntity<String> createStaff(@RequestBody CreateStaffRequest request) {
        try {
            // Validate that the creator is a branch manager
            Optional<User> managerUser = userRepository.findByFirebaseUid(request.getCreatorFirebaseUid());
            if (managerUser.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Creator not found\",\"status\":\"error\"}");
            }
            
            // Check if creator is branch manager
            if (!managerUser.get().getRole().getRole().equals(Role.Role_Type.BRANCH_MANAGER)) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Only branch managers can create staff\",\"status\":\"error\"}");
            }

            // Find manager's branch
            Optional<Staff> managerStaff = staffRepository.findByUser(managerUser.get());
            if (managerStaff.isEmpty() || managerStaff.get().getBranch() == null) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Manager branch not found\",\"status\":\"error\"}");
            }

            Branch branch = managerStaff.get().getBranch();

            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Email already exists\",\"status\":\"error\"}");
            }

            // Create Firebase user
            UserRecord.CreateRequest firebaseRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getFirstName() + " " + request.getLastName())
                .setEmailVerified(false);

            UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(firebaseRequest);

            // Get staff role
            Role staffRole = roleRepository.findByRole(Role.Role_Type.STAFF)
                .orElseThrow(() -> new RuntimeException("Staff role not found"));

            // Create User entity using explicit setters
            User user = new User();
            user.setFirebaseUid(firebaseUser.getUid());
            user.setEmail(request.getEmail());
            user.setName(request.getFirstName() + " " + request.getLastName());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setRole(staffRole);
            user.setIsActive(true);

            User savedUser = userRepository.save(user);

            // Create Staff entry using explicit setters
            Staff staff = new Staff();
            staff.setUser(savedUser);
            staff.setFirstName(request.getFirstName());
            staff.setLastName(request.getLastName());
            staff.setEmail(request.getEmail());
            staff.setAddress(request.getAddress());
            staff.setTel(request.getPhoneNumber());
            staff.setBranch(branch);
            staff.setManager(managerUser.get());
            
            // Set new fields for updated schema
            staff.setSalary(request.getSalary() != null ? request.getSalary() : new BigDecimal("0.00"));
            staff.setStaffTypes(request.getStaffTypes() != null ? request.getStaffTypes() : new HashSet<>());
            staff.setHireDate(LocalDateTime.now());
            staff.setIsActive(true);

            staffRepository.save(staff);

            return ResponseEntity.ok("{\"message\":\"Staff created successfully\",\"status\":\"success\",\"firebaseUid\":\"" + firebaseUser.getUid() + "\"}");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"message\":\"Failed to create staff: " + e.getMessage() + "\",\"status\":\"error\"}");
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

    /**
     * Get staff members for a specific manager
     */
    @GetMapping("/staff/manager/{managerFirebaseUid}")
    public ResponseEntity<String> getStaffByManager(@PathVariable String managerFirebaseUid) {
        try {
            // Find the manager user
            Optional<User> managerUser = userRepository.findByFirebaseUid(managerFirebaseUid);
            if (managerUser.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"Manager not found\",\"status\":\"error\"}");
            }

            // Check if user is actually a manager
            if (!managerUser.get().getRole().getRole().equals(Role.Role_Type.BRANCH_MANAGER)) {
                return ResponseEntity.badRequest()
                    .body("{\"message\":\"User is not a branch manager\",\"status\":\"error\"}");
            }

            // Find staff members managed by this manager
            List<Staff> staffMembers = staffRepository.findByManager(managerUser.get());

            StringBuilder result = new StringBuilder();
            result.append("{\"staff\":[");
            
            for (int i = 0; i < staffMembers.size(); i++) {
                Staff staff = staffMembers.get(i);
                if (i > 0) result.append(",");
                
                result.append("{")
                    .append("\"id\":").append(staff.getId()).append(",")
                    .append("\"firstName\":\"").append(staff.getFirstName()).append("\",")
                    .append("\"lastName\":\"").append(staff.getLastName()).append("\",")
                    .append("\"email\":\"").append(staff.getEmail()).append("\",")
                    .append("\"phone\":\"").append(staff.getTel() != null ? staff.getTel() : "").append("\",")
                    .append("\"address\":\"").append(staff.getAddress() != null ? staff.getAddress() : "").append("\",")
                    .append("\"salary\":").append(staff.getSalary() != null ? staff.getSalary() : 0).append(",")
                    .append("\"isActive\":").append(staff.getIsActive() != null ? staff.getIsActive() : true).append(",")
                    .append("\"staffTypes\":[");
                
                // Handle staff types
                if (staff.getStaffTypes() != null && !staff.getStaffTypes().isEmpty()) {
                    int typeIndex = 0;
                    for (String type : staff.getStaffTypes()) {
                        if (typeIndex > 0) result.append(",");
                        result.append("\"").append(type.toLowerCase()).append("\"");
                        typeIndex++;
                    }
                }
                
                result.append("],")
                    .append("\"firebaseUid\":\"").append(staff.getUser().getFirebaseUid()).append("\"")
                    .append("}");
            }
            
            result.append("],\"status\":\"success\"}");
            return ResponseEntity.ok(result.toString());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"message\":\"Failed to get staff: " + e.getMessage() + "\",\"status\":\"error\"}");
        }
    }
}
