package com.thivinu.inventoryapi.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thivinu.inventoryapi.Dto.BranchResolveResponse;
import com.thivinu.inventoryapi.Dto.InventoryRequest;
import com.thivinu.inventoryapi.Dto.InventoryResponse;
import com.thivinu.inventoryapi.Entity.Category;
import com.thivinu.inventoryapi.Entity.InventoryItem;
import com.thivinu.inventoryapi.Exception.InventoryNotFoundException;
import com.thivinu.inventoryapi.Mapper.InventoryMapper;
import com.thivinu.inventoryapi.Repository.CategoryRepository;
import com.thivinu.inventoryapi.Repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryMapper inventoryMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final BranchResolverService branchResolverService;

    private static final String TOPIC = "low-stock-topic";

    // CREATE
    public InventoryResponse addInventoryItem(InventoryRequest request) {
        // Resolve or create category
        Category category = categoryRepository.findByName(request.getCategory());
        if (category == null) {
            category = new Category();
            category.setName(request.getCategory());
            category = categoryRepository.save(category);
        }

        // Resolve branchId from user_id via Branch service
        BranchResolveResponse branch = branchResolverService.resolveBranch(request.getUser_id());
        if (branch == null || branch.branchId() == null) {
            throw new IllegalArgumentException(
                    "Branch service did not return a branchId for user_id=" + request.getUser_id()
            );
        }

        // Map request -> entity (sku, unit, cost/selling price, etc.)
        InventoryItem item = inventoryMapper.toInventoryItem(request);
        item.setCategory(category);
        item.setBranchId(branch.branchId());

        // Persist
        InventoryItem saved = inventoryRepository.save(item);

        // Optional: emit low-stock event on create as well
        try {
            sendLowStockEvent(saved);
        } catch (JsonProcessingException e) {
            log.warn("Failed to publish low-stock event on create", e);
        }

        return inventoryMapper.fromInventoryItem(saved);
    }

    // UPDATE
    public InventoryResponse updateInventoryItem(Long id, InventoryRequest request) throws JsonProcessingException {
        InventoryItem existingItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(
                        String.format("Cannot find Inventory: No inventory found for id: %s", id)
                ));

        if (request.getId() != null && !id.equals(request.getId())) {
            throw new IllegalArgumentException("ID in path and request body do not match");
        }

        // Resolve or create category
        Category category = categoryRepository.findByName(request.getCategory());
        if (category == null) {
            category = new Category();
            category.setName(request.getCategory());
            category = categoryRepository.save(category);
        }

        // Resolve branchId from user_id via Branch service
        BranchResolveResponse branch = branchResolverService.resolveBranch(request.getUser_id());
        if (branch == null || branch.branchId() == null) {
            throw new IllegalArgumentException(
                    "Branch service did not return a branchId for user_id=" + request.getUser_id()
            );
        }

        // Merge (align with entity + DTOs)
        existingItem.setName(request.getName());
        existingItem.setSku(request.getSku());
        existingItem.setUnit(request.getUnit());
        existingItem.setQuantity(request.getQuantity());
        existingItem.setCostPricePerUnit(request.getCostPricePerUnit());
        existingItem.setSellingPricePerUnit(request.getSellingPricePerUnit());
        existingItem.setThreshold(request.getThreshold());
        existingItem.setCategory(category);
        existingItem.setBranchId(branch.branchId());

        // Save
        InventoryItem saved = inventoryRepository.save(existingItem);

        // Emit low-stock event if needed
        sendLowStockEvent(saved);

        return inventoryMapper.fromInventoryItem(saved);
    }

    private void sendLowStockEvent(InventoryItem item) throws JsonProcessingException {
        if (item.getQuantity() >= item.getThreshold()) return;

        ObjectMapper objectMapper = new ObjectMapper();
        String eventJson = objectMapper.writeValueAsString(
                Map.of(
                        "itemId", item.getId(),
                        "itemName", item.getName(),
                        "quantity", item.getQuantity(),
                        "threshold", item.getThreshold()
                )
        );

        kafkaTemplate.send(TOPIC, eventJson)
                .whenComplete((result, ex) -> {
                    if (ex == null) log.info("Kafka event sent: {}", eventJson);
                    else log.error("Kafka send failed", ex);
                });
    }

    // DELETE
    public boolean deleteInventoryItem(Long inventoryId) {
        if (inventoryRepository.existsById(inventoryId)) {
            inventoryRepository.deleteById(inventoryId);
            return true;
        }
        return false;
    }

    // READ
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

    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(inventoryMapper::fromInventoryItem)
                .toList();
    }
}
