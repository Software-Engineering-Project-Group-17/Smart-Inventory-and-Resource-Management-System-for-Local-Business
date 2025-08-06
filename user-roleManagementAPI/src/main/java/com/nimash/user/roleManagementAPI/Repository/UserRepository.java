package com.nimash.user.roleManagementAPI.Repository;

import com.nimash.user.roleManagementAPI.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
    List<User> findByIsActiveTrue();

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}