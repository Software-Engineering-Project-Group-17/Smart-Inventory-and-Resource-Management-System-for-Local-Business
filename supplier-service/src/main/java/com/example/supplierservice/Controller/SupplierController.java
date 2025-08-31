package com.example.supplierservice.Controller;

import com.example.supplierservice.Dto.SupplierRequest;
import com.example.supplierservice.Dto.SupplierResponse;
import com.example.supplierservice.Service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(supplierService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> list(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(
                userId != null ? supplierService.listByUser(userId) : supplierService.listAll()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(supplierService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
