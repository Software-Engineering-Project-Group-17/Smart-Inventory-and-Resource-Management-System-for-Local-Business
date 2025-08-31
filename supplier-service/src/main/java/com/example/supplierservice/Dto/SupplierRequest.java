package com.example.supplierservice.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierRequest {
    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "supplierName is required")
    private String supplierName;

    private String supplierTel;
    private String address;

    @Email(message = "supplierEmail must be valid")
    private String supplierEmail;
}
