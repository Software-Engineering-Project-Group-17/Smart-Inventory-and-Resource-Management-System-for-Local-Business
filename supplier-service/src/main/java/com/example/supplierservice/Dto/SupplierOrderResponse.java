package com.example.supplierservice.Dto;

import com.example.supplierservice.Entity.SupplierOrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record SupplierOrderResponse(
        Long id,
        SupplierOrderStatus status,
        BigDecimal quantity,
        Long supplierItemId,
        Integer branchId,
        LocalDateTime createdAt
) {}
