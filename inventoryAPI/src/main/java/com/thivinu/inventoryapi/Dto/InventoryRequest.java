package com.thivinu.inventoryapi.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryRequest {

    Long id;
    @NotBlank(message = "Inventory name is required")
    private String name;

    @Min(value = 0, message = "Quantity must be 0 or greater")
    private int quantity;

    @Positive(message = "Price must be greater than 0")
    private double price;

    @NotBlank(message = "Supplier name is required")
    private String supplier;

    @NotBlank(message = "Category name is required")
    private String category;

    @Min(value = 0, message = "Threshold must be 0 or greater")
    private int threshold;
}
