package com.nimash.user.roleManagementAPI.Controller;

import com.nimash.user.roleManagementAPI.Dto.BranchRequest;
import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Service.BranchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/branch")
@PreAuthorize("hasRole('OWNER')")
public class BranchController {

    private final BranchService branchService;
    
    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }
    @PostMapping
    public ResponseEntity<Branch> createBranch(@Valid @RequestBody BranchRequest request) {
        Branch createdBranch = branchService.createBranch(request);
        return ResponseEntity.ok(createdBranch);
    }

    @DeleteMapping("/{branchId}")
    public ResponseEntity<String> deleteBranch(@PathVariable Long branchId) {
        branchService.deleteBranchById(branchId);
        return ResponseEntity.ok("Branch deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Branch> updateBranch(
            @PathVariable Long id,
            @RequestBody @Valid BranchRequest request) {

        Branch updated = branchService.updateBranch(id, request);
        return ResponseEntity.ok(updated);
    }
}
