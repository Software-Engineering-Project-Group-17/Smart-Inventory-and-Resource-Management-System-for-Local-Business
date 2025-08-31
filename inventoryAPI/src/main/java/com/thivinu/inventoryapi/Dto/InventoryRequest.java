// com/thivinu/inventoryapi/Dto/InventoryRequest.java
package com.thivinu.inventoryapi.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class InventoryRequest {

    private Long id;

    @NotNull(message = "user_id is required")
    private Long user_id; // used to resolve branch_id

    @NotBlank(message = "Inventory name is required")
    private String name;

    @NotBlank(message = "Inventory SKU is required")
    private String sku;

    @NotBlank(message = "Inventory unit is required")
    private String unit;

    @Min(value = 0, message = "Quantity must be 0 or greater")
    private int quantity;

    @Positive(message = "Cost Price must be greater than 0")
    private double costPricePerUnit;

    @Positive(message = "Selling Price must be greater than 0")
    private double sellingPricePerUnit;

    @NotBlank(message = "Category name is required")
    private String category;

    @Min(value = 0, message = "Threshold must be 0 or greater")
    private int threshold;
}
