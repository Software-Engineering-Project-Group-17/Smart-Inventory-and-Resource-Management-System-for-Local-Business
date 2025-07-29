package com.thivinu.inventoryapi.Controller;

import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.InventoryItem;
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
    public ResponseEntity<InventoryItem> addInventoryItem(@RequestBody @Valid InventoryRequest request) {
        InventoryItem savedItem = inventoryService.addInventoryItem(request);
        return ResponseEntity.ok(savedItem);
    }
    @PutMapping("/updateInventory/{id}")
    public ResponseEntity<?> updateInventoryItem(@PathVariable Long id, @RequestBody @Valid InventoryRequest request) {
        InventoryItem updated = inventoryService.updateInventoryItem(id, request);
        if (updated != null){
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("/deleteInventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Long id){
        boolean deleted = inventoryService.deleteInventoryItem(id);
        if (deleted) {
            return ResponseEntity.ok("Item deleted successfully");
        }
        else{
            return ResponseEntity.ok("ItemId is not found ");
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable Long id) {
        InventoryResponse response = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(response);
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

    //API to get low stock items
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

}
