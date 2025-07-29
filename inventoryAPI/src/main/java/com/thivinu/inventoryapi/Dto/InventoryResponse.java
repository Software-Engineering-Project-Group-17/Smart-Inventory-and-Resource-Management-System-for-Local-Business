package com.thivinu.inventoryapi.Dto;

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
