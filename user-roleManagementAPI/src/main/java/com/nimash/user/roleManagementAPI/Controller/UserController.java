package com.nimash.user.roleManagementAPI.Controller;

import com.nimash.user.roleManagementAPI.Dto.UserProfileResponse;
import com.nimash.user.roleManagementAPI.Entity.User;
import com.nimash.user.roleManagementAPI.Service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/owner/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        List<UserProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

//    @GetMapping("/role/{role}")
//    public ResponseEntity<List<UserProfileResponse>> getUsersByRole(@PathVariable String role) {
//        User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
//        List<UserProfileResponse> users = userService.getUsersByRole(userRole);
//        return ResponseEntity.ok(users);
//    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable String userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String userId) {
        userService.activateUser(userId);
        return ResponseEntity.ok().build();
    }

}