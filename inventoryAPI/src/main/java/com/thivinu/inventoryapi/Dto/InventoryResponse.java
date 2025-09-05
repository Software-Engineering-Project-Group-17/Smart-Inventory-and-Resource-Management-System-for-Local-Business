// com/thivinu/inventoryapi/Dto/InventoryResponse.java
package com.thivinu.inventoryapi.Dto;

import lombok.Builder;

@Builder
public record InventoryResponse(
        Long id,
        String name,
        String sku,
        String unit,
        int quantity,
        double costPricePerUnit,
        double sellingPricePerUnit,
        int threshold,
        String category,
        Integer branchId
) {}