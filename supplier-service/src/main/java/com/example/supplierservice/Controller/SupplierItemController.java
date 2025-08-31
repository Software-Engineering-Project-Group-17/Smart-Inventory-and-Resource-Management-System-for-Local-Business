package com.example.supplierservice.Controller;

import com.example.supplierservice.Dto.SupplierItemRequest;
import com.example.supplierservice.Dto.SupplierItemResponse;
import com.example.supplierservice.Service.SupplierItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-items")
@RequiredArgsConstructor
public class SupplierItemController {

    private final SupplierItemService itemService;

    @PostMapping
    public ResponseEntity<SupplierItemResponse> create(@Valid @RequestBody SupplierItemRequest req) {
        return ResponseEntity.ok(itemService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierItemResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<SupplierItemResponse>> list(@RequestParam(required = false) Long supplierId) {
        return ResponseEntity.ok(
                supplierId != null ? itemService.listBySupplier(supplierId) : itemService.listAll()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierItemResponse> update(@PathVariable Long id, @Valid @RequestBody SupplierItemRequest req) {
        return ResponseEntity.ok(itemService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
