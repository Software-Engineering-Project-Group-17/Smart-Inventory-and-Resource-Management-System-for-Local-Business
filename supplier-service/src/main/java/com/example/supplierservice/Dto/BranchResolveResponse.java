package com.example.supplierservice.Dto;

import lombok.Builder;

@Builder
public record BranchResolveResponse(Integer branchId, String branchName) {}
