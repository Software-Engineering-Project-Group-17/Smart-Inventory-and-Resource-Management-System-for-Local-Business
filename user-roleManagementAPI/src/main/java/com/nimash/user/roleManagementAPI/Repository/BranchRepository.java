package com.nimash.user.roleManagementAPI.Repository;

import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByName(String name);
    List<Branch> findByOwner(User owner);
    List<Branch> findByOwnerFirebaseUid(String firebaseUid);
}
