package com.example.supplierservice.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierItemRequest {
    @NotNull(message = "supplierId is required")
    private Long supplierId;

    @NotBlank(message = "itemName is required")
    private String itemName;

    @NotNull @Positive(message = "itemPrice must be positive")
    private BigDecimal itemPrice;
}
