package com.example.customerservice.Dto;

import com.example.customerservice.Entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderStatusUpdateRequest {
    @NotNull
    private OrderStatus status;
}
