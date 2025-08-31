package com.nimash.user.roleManagementAPI.Repository;

import com.nimash.user.roleManagementAPI.Entity.Staff;
import com.nimash.user.roleManagementAPI.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    Optional<Staff> findByEmail(String email);
    
    Optional<Staff> findByUser(User user);
    
    List<Staff> findAllByUser(User user);
    
    // For now, we'll implement staff type filtering in the service layer
    // since PostgreSQL array queries in JPA can be complex
    
    boolean existsByEmail(String email);
}
