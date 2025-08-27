package com.example.supplierservice.Dto;

import jakarta.validation.constraints.*;

public record SupplierRequest(
    @NotBlank String name,
    @Email String contactEmail,
    @NotBlank String phone,
    String address
) {}
