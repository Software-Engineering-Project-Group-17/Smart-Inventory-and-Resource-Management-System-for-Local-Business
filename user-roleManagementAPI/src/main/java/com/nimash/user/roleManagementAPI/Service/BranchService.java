package com.nimash.user.roleManagementAPI.Service;

import com.nimash.user.roleManagementAPI.Dto.BranchRequest;
import com.nimash.user.roleManagementAPI.Entity.Branch;
import com.nimash.user.roleManagementAPI.Mapper.BranchMapper;
import com.nimash.user.roleManagementAPI.Repository.BranchRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    public Branch createBranch(BranchRequest request) {
        System.out.println("entering the create branch");
        // Check for duplicate branch name
        branchRepository.findByName(request.getName()).ifPresent(existing -> {
            throw new RuntimeException("Branch with name '" + request.getName() + "' already exists.");
        });
        Branch branch = BranchMapper.toBranch(request);
        return branchRepository.save(branch);
    }
    public void deleteBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with id: " + id));

        if (!branch.getUsers().isEmpty()) {
            throw new IllegalStateException("Cannot delete branch. Users are still assigned to this branch.");
        }

        branchRepository.delete(branch);
    }

    public Branch updateBranch(Long id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));

        BranchMapper.updateBranchFromRequest(branch, request);

        return branchRepository.save(branch);
    }

}
