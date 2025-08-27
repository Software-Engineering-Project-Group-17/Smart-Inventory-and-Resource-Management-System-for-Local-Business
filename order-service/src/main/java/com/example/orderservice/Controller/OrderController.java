package com.example.orderservice.Controller;

import com.example.orderservice.Dto.CreateOrderRequest;
import com.example.orderservice.Dto.InvoiceResponse;
import com.example.orderservice.Dto.OrderResponse;
import com.example.orderservice.Entity.OrderStatus;
import com.example.orderservice.Entity.PaymentStatus;
import com.example.orderservice.Service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.ok(orderService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list() {
        return ResponseEntity.ok(orderService.list());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> status(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<OrderResponse> payment(@PathVariable Long id, @RequestParam PaymentStatus payment) {
        return ResponseEntity.ok(orderService.updatePayment(id, payment));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<InvoiceResponse> invoice(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.invoice(id));
    }
}
