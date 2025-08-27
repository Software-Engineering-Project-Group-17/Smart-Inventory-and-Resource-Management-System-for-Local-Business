package com.example.supplierservice.Dto;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.List;

public record PurchaseOrderResponse(Long id, Long supplierId, String status, Instant createdAt, List<Line> lines, BigDecimal total) {
    public record Line(Long id, Long itemId, String itemName, Integer quantity, java.math.BigDecimal unitPrice) {}
}
