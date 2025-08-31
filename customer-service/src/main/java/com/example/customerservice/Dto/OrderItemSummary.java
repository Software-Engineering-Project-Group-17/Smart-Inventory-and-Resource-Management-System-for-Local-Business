package com.example.customerservice.Dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record OrderItemSummary(
        Long id,
        Long inventoryId,
        Integer quantity,
        BigDecimal lineAmount // quantity * inventory.sellingPricePerUnit
) {}
