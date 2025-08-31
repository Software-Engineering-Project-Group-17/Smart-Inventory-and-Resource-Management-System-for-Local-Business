package com.example.supplierservice.Controller;

import com.example.supplierservice.Dto.SupplierOrderRequest;
import com.example.supplierservice.Dto.SupplierOrderResponse;
import com.example.supplierservice.Entity.SupplierOrderStatus;
import com.example.supplierservice.Service.SupplierOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-orders")
@RequiredArgsConstructor
public class SupplierOrderController {

    private final SupplierOrderService orderService;

    @PostMapping
    public ResponseEntity<SupplierOrderResponse> create(@Valid @RequestBody SupplierOrderRequest req) {
        return ResponseEntity.ok(orderService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierOrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<SupplierOrderResponse>> list(
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) SupplierOrderStatus status
    ) {
        return ResponseEntity.ok(orderService.list(branchId, status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupplierOrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam SupplierOrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
