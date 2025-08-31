package com.thivinu.inventoryapi.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/add")
    public ResponseEntity<InventoryResponse> addInventoryItem(@RequestBody @Valid InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.addInventoryItem(request));
    }

    @PutMapping("/updateInventory/{id}")
    public ResponseEntity<InventoryResponse> updateInventoryItem(@PathVariable Long id,
                                                                 @RequestBody @Valid InventoryRequest request)
            throws JsonProcessingException {
        return ResponseEntity.ok(inventoryService.updateInventoryItem(id, request));
    }

    @DeleteMapping("/deleteInventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Long id) {
        boolean deleted = inventoryService.deleteInventoryItem(id);
        if (deleted) return ResponseEntity.ok("Item deleted successfully");
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/stock")
    public ResponseEntity<List<InventoryResponse>> getStockLevels() {
        return ResponseEntity.ok(inventoryService.getAllStockLevels());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<InventoryResponse>> searchInventory(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(inventoryService.searchInventory(category, keyword, page, size));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}
