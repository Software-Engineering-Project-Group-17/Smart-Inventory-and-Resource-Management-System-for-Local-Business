package com.example.supplierservice.Dto;

import com.example.supplierservice.Entity.SupplierOrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierOrderRequest {

    @NotNull(message = "userId is required to resolve branchId")
    private Long userId;

    @NotNull(message = "supplierItemId is required")
    private Long supplierItemId;

    @NotNull @Positive(message = "quantity must be positive")
    private BigDecimal quantity;

    // optional; default PENDING if null
    private SupplierOrderStatus status;
}
