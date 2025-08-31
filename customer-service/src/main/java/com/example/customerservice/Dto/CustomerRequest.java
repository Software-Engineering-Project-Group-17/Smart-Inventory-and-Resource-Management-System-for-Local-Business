package com.example.customerservice.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerRequest {
    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "customerName is required")
    private String customerName;

    private String customerTel;
    private String address;

    @Email(message = "customerEmail must be valid")
    private String customerEmail;

    // optional on create; defaults to 0
    private Long loyaltyPoints;
}
