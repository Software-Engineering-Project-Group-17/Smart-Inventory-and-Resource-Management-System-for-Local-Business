package com.nimash.user.roleManagementAPI.Mapper;

import com.nimash.user.roleManagementAPI.Dto.BranchRequest;
import com.nimash.user.roleManagementAPI.Entity.Branch;

public class BranchMapper {
    public static Branch toBranch(BranchRequest request) {
        Branch branch = new Branch();
        branch.setName(request.getName());
        branch.setLocation(request.getLocation());
        branch.setContactNumber(request.getContactNumber());
        branch.setDescription(request.getDescription());
        return branch;
    }
    public static void updateBranchFromRequest(Branch branch, BranchRequest request) {
        branch.setName(request.getName());
        branch.setLocation(request.getLocation());
        branch.setContactNumber(request.getContactNumber());
        branch.setDescription(request.getDescription());
    }
}
