package com.nimash.user.roleManagementAPI.Repository;

import com.nimash.user.roleManagementAPI.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByFirebaseUid(String firebaseUid);

    Optional<User> findByEmail(String email);
    
    List<User> findByIsActiveTrue();

    boolean existsByFirebaseUid(String firebaseUid);

    boolean existsByEmail(String email);
    
    @Query("SELECT u.userId, u.email, u.name, u.createdAt, u.isActive, r.role FROM User u LEFT JOIN u.role r WHERE u.firebaseUid = :firebaseUid")
    Object[] findUserDataByFirebaseUid(@Param("firebaseUid") String firebaseUid);
}