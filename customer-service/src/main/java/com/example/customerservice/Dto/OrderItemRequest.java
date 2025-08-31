package com.example.customerservice.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemRequest {
    @NotNull(message = "inventoryId is required")
    private Long inventoryId;

    @NotNull @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;
}
