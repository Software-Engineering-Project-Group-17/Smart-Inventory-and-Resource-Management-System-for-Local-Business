package com.example.customerservice.Dto;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummary(Long id, BigDecimal totalAmount, String status, String paymentStatus, Instant createdAt) {}
