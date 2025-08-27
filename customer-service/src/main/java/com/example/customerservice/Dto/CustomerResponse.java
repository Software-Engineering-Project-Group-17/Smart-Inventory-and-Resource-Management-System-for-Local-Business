package com.example.customerservice.Dto;

public record CustomerResponse(
    Long id, String name, String email, String phone, String address, Integer loyaltyPoints
) {}
