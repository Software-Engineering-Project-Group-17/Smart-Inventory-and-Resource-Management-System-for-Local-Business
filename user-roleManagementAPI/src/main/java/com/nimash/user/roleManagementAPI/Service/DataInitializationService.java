package com.nimash.user.roleManagementAPI.Service;

import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Entity.Role;
import com.nimash.user.roleManagementAPI.Repository.BranchRepository;
import com.nimash.user.roleManagementAPI.Repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DataInitializationService {

    private static final Logger log = LoggerFactory.getLogger(DataInitializationService.class);
    
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;

    public DataInitializationService(RoleRepository roleRepository, BranchRepository branchRepository) {
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
    }

    @PostConstruct
    public void initializeData() {
        try {
            log.info("Starting data initialization...");
            initializeRoles();
            initializeDefaultBranch();
            log.info("Data initialization completed successfully");
        } catch (Exception e) {
            log.warn("Data initialization failed, but application will continue: {}", e.getMessage());
            log.debug("Full stack trace:", e);
            // Don't throw the exception - let the application start even if initialization fails
        }
    }

    private void initializeRoles() {
        try {
            log.info("Initializing roles...");
            
            createRoleIfNotExists(Role.Role_Type.OWNER, "System Owner - Full access to all features");
            createRoleIfNotExists(Role.Role_Type.BRANCH_MANAGER, "Branch Manager - Manages branch operations and staff");
            createRoleIfNotExists(Role.Role_Type.STAFF, "Staff Member - Basic operational access");
            createRoleIfNotExists(Role.Role_Type.SUPPLIER, "Supplier - Manages supply chain operations");
            createRoleIfNotExists(Role.Role_Type.CUSTOMER, "Customer - Basic customer access");
            
            log.info("Roles initialization completed");
        } catch (Exception e) {
            log.warn("Failed to initialize roles: {}", e.getMessage());
            throw e; // Re-throw to be caught by the main initialization method
        }
    }

    private void createRoleIfNotExists(Role.Role_Type roleType, String description) {
        try {
            if (roleRepository.findByRole(roleType).isEmpty()) {
                Role role = new Role();
                role.setRole(roleType);
                role.setDescription(description);
                roleRepository.save(role);
                log.info("Created role: {}", roleType);
            } else {
                log.debug("Role {} already exists", roleType);
            }
        } catch (Exception e) {
            log.warn("Failed to create role {}: {}", roleType, e.getMessage());
            throw e;
        }
    }

    private void initializeDefaultBranch() {
        try {
            log.info("Initializing default branch...");
            
            if (branchRepository.findByName("Main Branch").isEmpty()) {
                Branch mainBranch = new Branch();
                mainBranch.setName("Main Branch");
                mainBranch.setLocation("Head Office");
                mainBranch.setContactNumber("+1-555-0100");
                mainBranch.setDescription("Main branch for system administration");
                branchRepository.save(mainBranch);
                log.info("Created default branch: Main Branch");
            } else {
                log.debug("Default branch already exists");
            }
        } catch (Exception e) {
            log.warn("Failed to initialize default branch: {}", e.getMessage());
            throw e;
        }
    }
}
