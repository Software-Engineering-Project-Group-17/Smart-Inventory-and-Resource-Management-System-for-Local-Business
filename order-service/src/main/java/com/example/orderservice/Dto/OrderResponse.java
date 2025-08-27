package com.example.orderservice.Dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    Long customerId,
    String status,
    String paymentStatus,
    BigDecimal totalAmount,
    Instant createdAt,
    List<Item> items
) {
    public record Item(Long id, Long itemId, String itemName, BigDecimal unitPrice, Integer quantity, BigDecimal subtotal) {}
}
