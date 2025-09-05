// com/thivinu/inventoryapi/Mapper/InventoryMapper.java
package com.thivinu.inventoryapi.Mapper;

import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public InventoryItem toInventoryItem(InventoryRequest request) {
        if (request == null) return null;

        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setSku(request.getSku());
        item.setUnit(request.getUnit());
        item.setQuantity(request.getQuantity());
        item.setCostPricePerUnit(request.getCostPricePerUnit());
        item.setSellingPricePerUnit(request.getSellingPricePerUnit());
        item.setThreshold(request.getThreshold());
        // category and branchId are set elsewhere (service layer)
        return item;
    }

    public InventoryResponse fromInventoryItem(InventoryItem item) {
        if (item == null) return null;

        return InventoryResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .sku(item.getSku())
                .unit(item.getUnit())
                .quantity(item.getQuantity())
                .costPricePerUnit(item.getCostPricePerUnit())
                .sellingPricePerUnit(item.getSellingPricePerUnit())
                .threshold(item.getThreshold())
                .category(item.getCategory() != null ? item.getCategory().getName() : null)
                .branchId(item.getBranchId())
                .build();
    }
}