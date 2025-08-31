package com.example.customerservice.Dto;

import com.example.customerservice.Entity.OrderStatus;
import com.example.customerservice.Entity.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record OrderResponse(
        Long id,
        Long customerId,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        Integer branchId,
        List<OrderItemSummary> items
) {}
