package com.thivinu.inventoryapi.Dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public record InventoryResponse(
        Long id,
        String name,
        int quantity,
        double price,
        String supplier,
        String category,
        int threshold
) {
    // No additional body needed for a record unless you want custom methods
}
