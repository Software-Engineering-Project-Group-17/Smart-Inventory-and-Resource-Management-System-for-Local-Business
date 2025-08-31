package com.example.customerservice.Dto;

import lombok.Builder;

@Builder
public record BranchResolveResponse(Integer branchId, String branchName) {}
