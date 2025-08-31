package com.example.customerservice.Dto;

import com.example.customerservice.Dto.OrderItemRequest;
import com.example.customerservice.Entity.OrderStatus;
import com.example.customerservice.Entity.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderCreateRequest {

    // the employee/user placing the order -> used to resolve branchId
    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "customerId is required")
    private Long customerId;

    @Valid
    @Size(min = 1, message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    // optional overrides, else defaults apply
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
}
