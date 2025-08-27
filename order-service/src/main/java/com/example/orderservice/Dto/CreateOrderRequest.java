package com.example.orderservice.Dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<Item> items,
    String payment // "PAID" or "UNPAID"
) {
    public record Item(
        @NotNull Long itemId,
        @NotBlank String itemName,
        @NotNull BigDecimal unitPrice,
        @NotNull @Min(1) Integer quantity
    ) {}
}
