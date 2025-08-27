package com.example.supplierservice.Controller;

import com.example.supplierservice.Dto.SupplierRequest;
import com.example.supplierservice.Dto.SupplierResponse;
import com.example.supplierservice.Service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/suppliers") @RequiredArgsConstructor
public class SupplierController {
    private final SupplierService service;

    @PostMapping
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest r){ return ResponseEntity.ok(service.create(r)); }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest r){ return ResponseEntity.ok(service.update(id, r)); }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> get(@PathVariable Long id){ return ResponseEntity.ok(service.get(id)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> del(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> list(){ return ResponseEntity.ok(service.list()); }
}
