package com.thivinu.inventoryapi.Mapper;

import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {
    public InventoryItem toInventoryItem(InventoryRequest request) {
        if (request == null) {
            return null;
        }
        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setSupplier(request.getSupplier());
        item.setThreshold(request.getThreshold());

        return item;
    }
    public InventoryResponse fromInventoryItem(InventoryItem item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .supplier(item.getSupplier())
                .threshold(item.getThreshold())
                .category(item.getCategory().getName()) // ✅ Only send category name
                .build();
    }

}
