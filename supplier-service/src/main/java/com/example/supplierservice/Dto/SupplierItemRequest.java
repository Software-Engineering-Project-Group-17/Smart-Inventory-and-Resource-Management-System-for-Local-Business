package com.example.supplierservice.Dto;

import jakarta.validation.constraints.*;

public record SupplierItemRequest(@NotNull Long supplierId, @NotNull Long itemId, @NotBlank String itemName) {}
