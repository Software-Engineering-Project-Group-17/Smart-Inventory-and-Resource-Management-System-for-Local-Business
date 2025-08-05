package com.thivinu.inventoryapi.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.Category;
import com.thivinu.inventoryapi.Entity.InventoryItem;
import com.thivinu.inventoryapi.Exception.InventoryNotFoundException;
import com.thivinu.inventoryapi.Mapper.CategoryMapper;
import com.thivinu.inventoryapi.Mapper.InventoryMapper;
import com.thivinu.inventoryapi.Repository.CategoryRepository;
import com.thivinu.inventoryapi.Repository.InventoryRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryMapper inventoryMapper;
    private final CategoryMapper categoryMapper;

    @Autowired
    private KafkaTemplate<String,String> kafkaTemplate;
    private final Logger log;


    private static final String TOPIC = "low-stock-topic";

    public InventoryItem addInventoryItem(InventoryRequest request){
        // In this request.getCategory() reads the category of the inventory item
        Category category = categoryRepository.findByName(request.getCategory());
        if (category == null) {
            category = new Category(request.getCategory());
            categoryRepository.save(category);
        }
        // Now we have the required category for the inventory, now we want to get the category_id from the category
        InventoryItem item = inventoryMapper.toInventoryItem(request);
        item.setCategory(category);
        return  inventoryRepository.save(item);
    }
    public InventoryItem updateInventoryItem(Long id, InventoryRequest request) throws JsonProcessingException {
        InventoryItem existingItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(
                        String.format("Cannot find Inventory: No inventory found for id: %s", id)
                ));

        // Validate ID match
        if (request.getId() != null && !id.equals(request.getId())) {
            throw new RuntimeException("ID in path and request body do not match");
        }

        // Handle category
        Category category = categoryRepository.findByName(request.getCategory());
        if (category == null) {
            category = new Category(request.getCategory());
            categoryRepository.save(category);
        }

        // Merge and save
        mergeInventory(existingItem, request, category);
        existingItem = inventoryRepository.save(existingItem);

        sendLowStockEvent(existingItem);

        return existingItem;
    }

    private void mergeInventory(InventoryItem inventory, InventoryRequest request, Category category) {
        inventory.setName(request.getName());
        inventory.setSupplier(request.getSupplier());
        inventory.setQuantity(request.getQuantity());
        inventory.setPrice(request.getPrice());
        inventory.setThreshold(request.getThreshold());
        inventory.setCategory(category);
    }

    private void sendLowStockEvent(InventoryItem item) throws JsonProcessingException {
        if (item.getQuantity() >= item.getThreshold()) return;

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> eventMap = Map.of(
                "itemId", item.getId(),
                "itemName", item.getName(),
                "quantity", item.getQuantity(),
                "threshold", item.getThreshold()
        );

        String eventJson = objectMapper.writeValueAsString(eventMap);

        kafkaTemplate.send(TOPIC, eventJson)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✅ Kafka event sent: {}", eventJson);
                    } else {
                        log.error("❌ Kafka send failed", ex);
                    }
                });
    }

    public boolean deleteInventoryItem(Long inventoryId) {
        if (inventoryRepository.existsById(inventoryId)) {
            inventoryRepository.deleteById(inventoryId);
            return true;
        }
        return false;
    }
    public InventoryResponse getInventoryById(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(
                        String.format("Inventory not found for ID: %s", id)
                ));

        return inventoryMapper.fromInventoryItem(item);
    }

    public List<InventoryResponse> getAllStockLevels() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::fromInventoryItem)
                .toList();
    }

    public Page<InventoryResponse> searchInventory(String category, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<InventoryItem> result = inventoryRepository.searchAndFilter(category, keyword, pageable);

        return result.map(inventoryMapper::fromInventoryItem);
    }

    //Get all low-stock items
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(inventoryMapper::fromInventoryItem)
                .toList();
    }

}
