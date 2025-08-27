package com.example.customerservice.Dto;

import jakarta.validation.constraints.*;

public record CustomerRequest(
    @NotBlank String name,
    @Email String email,
    @NotBlank String phone,
    String address
) {}
