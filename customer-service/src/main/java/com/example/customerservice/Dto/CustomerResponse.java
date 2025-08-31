package com.example.customerservice.Dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CustomerResponse(
        Long id,
        Long userId,
        String customerName,
        String customerTel,
        String address,
        Long loyaltyPoints,
        LocalDateTime createdDate,
        String customerEmail
) {}
