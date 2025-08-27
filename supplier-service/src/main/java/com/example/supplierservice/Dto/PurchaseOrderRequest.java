package com.example.supplierservice.Dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record PurchaseOrderRequest(@NotNull Long supplierId, @NotEmpty List<Line> lines) {
    public record Line(@NotNull Long itemId, @NotBlank String itemName, @NotNull Integer quantity, @NotNull BigDecimal unitPrice) {}
}
