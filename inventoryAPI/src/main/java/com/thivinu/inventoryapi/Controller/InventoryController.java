package com.thivinu.inventoryapi.Controller;

import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.InventoryItem;
import com.thivinu.inventoryapi.Service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
