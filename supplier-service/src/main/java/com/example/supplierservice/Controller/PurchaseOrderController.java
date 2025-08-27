package com.example.supplierservice.Controller;

import com.example.supplierservice.Dto.PurchaseOrderRequest;
import com.example.supplierservice.Dto.PurchaseOrderResponse;
import com.example.supplierservice.Entity.PurchaseOrderStatus;
import com.example.supplierservice.Service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/purchase-orders") @RequiredArgsConstructor
public class PurchaseOrderController {
    private final PurchaseOrderService service;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderRequest r){ return ResponseEntity.ok(service.create(r)); }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> get(@PathVariable Long id){ return ResponseEntity.ok(service.get(id)); }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponse> status(@PathVariable Long id, @RequestParam PurchaseOrderStatus status){ return ResponseEntity.ok(service.setStatus(id, status)); }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> list(){ return ResponseEntity.ok(service.list()); }
}
