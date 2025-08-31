package com.example.customerservice.Controller;

import com.example.customerservice.Dto.*;
import com.example.customerservice.Entity.OrderStatus;
import com.example.customerservice.Entity.PaymentStatus;
import com.thivinu.inventoryapi.Service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderCreateRequest req) {
        return ResponseEntity.ok(orderService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.list(customerId, branchId, status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest req
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, req.getStatus()));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<OrderResponse> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentStatusUpdateRequest req
    ) {
        return ResponseEntity.ok(orderService.updatePayment(id, req.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
