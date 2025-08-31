package com.example.supplierservice.Dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SupplierItemResponse(
        Long id,
        Long supplierId,
        String itemName,
        BigDecimal itemPrice
) {}
