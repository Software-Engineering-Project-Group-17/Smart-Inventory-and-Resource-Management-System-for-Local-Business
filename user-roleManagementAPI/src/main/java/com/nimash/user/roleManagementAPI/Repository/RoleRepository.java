package com.nimash.user.roleManagementAPI.Repository;

import com.nimash.user.roleManagementAPI.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRole(Role.Role_Type role);
    Optional<Role> findById(Long id);
}
