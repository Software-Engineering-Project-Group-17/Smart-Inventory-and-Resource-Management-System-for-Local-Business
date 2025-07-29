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

        return item;
    }
    public InventoryResponse fromInventoryItem(InventoryItem item) {
        if (item == null) {
            return null;
        }
        return new InventoryResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getSupplier(),
                item.getCategory() != null ? item.getCategory().getName() : null
        );
    }
}
