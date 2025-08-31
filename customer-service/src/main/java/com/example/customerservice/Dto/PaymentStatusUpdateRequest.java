package com.example.customerservice.Dto;

import com.example.customerservice.Entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentStatusUpdateRequest {
    @NotNull
    private PaymentStatus status;
}
