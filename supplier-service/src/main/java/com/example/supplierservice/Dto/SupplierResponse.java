package com.example.supplierservice.Dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record SupplierResponse(
        Long id,
        Long userId,
        String supplierName,
        String supplierTel,
        String address,
        String supplierEmail,
        LocalDateTime createdDate
) {}
