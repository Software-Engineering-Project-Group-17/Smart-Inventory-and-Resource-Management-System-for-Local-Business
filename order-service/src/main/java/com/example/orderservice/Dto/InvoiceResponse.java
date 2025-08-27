package com.example.orderservice.Dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record InvoiceResponse(
    Long orderId,
    String invoiceNumber,
    Instant issuedAt,
    BigDecimal totalAmount,
    List<Line> lines
) {
    public record Line(String itemName, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
}
