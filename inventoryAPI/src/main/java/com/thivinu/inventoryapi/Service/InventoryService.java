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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryMapper inventoryMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final BranchResolverService branchResolverService;
    private final ObjectMapper objectMapper; // reuse a single mapper

    private static final String TOPIC = "low-stock-topic";

    // CREATE
    @Transactional
    public InventoryResponse addInventoryItem(InventoryRequest request) {
        validateRequired(request);

        Category category = ensureCategory(request.getCategory());

        BranchResolveResponse branch = branchResolverService.resolveBranch(request.getUser_id());
        if (branch == null || branch.branchId() == null) {
            throw new IllegalArgumentException(
                    "Branch service did not return a branchId for user_id=" + request.getUser_id()
            );
        }

        InventoryItem item = inventoryMapper.toInventoryItem(request);
        item.setCategory(category);
        item.setBranchId(branch.branchId());

        InventoryItem saved = inventoryRepository.save(item);

        // Publish only after successful commit
        afterCommit(() -> trySendLowStockEvent(saved));

        return inventoryMapper.fromInventoryItem(saved);
    }

    // UPDATE
    @Transactional
    public InventoryResponse updateInventoryItem(Long id, InventoryRequest request) {
        InventoryItem existingItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(
                        String.format("Cannot find Inventory: No inventory found for id: %s", id)
                ));

        if (request.getId() != null && !id.equals(request.getId())) {
            throw new IllegalArgumentException("ID in path and request body do not match");
        }
        validateRequired(request);

        Category category = ensureCategory(request.getCategory());

        BranchResolveResponse branch = branchResolverService.resolveBranch(request.getUser_id());
        if (branch == null || branch.branchId() == null) {
            throw new IllegalArgumentException(
                    "Branch service did not return a branchId for user_id=" + request.getUser_id()
            );
        }

        // Merge
        existingItem.setName(request.getName());
        existingItem.setSku(request.getSku());
        existingItem.setUnit(request.getUnit());
        existingItem.setQuantity(request.getQuantity());
        existingItem.setCostPricePerUnit(request.getCostPricePerUnit());
        existingItem.setSellingPricePerUnit(request.getSellingPricePerUnit());
        existingItem.setThreshold(request.getThreshold());
        existingItem.setCategory(category);
        existingItem.setBranchId(branch.branchId());

        InventoryItem saved = inventoryRepository.save(existingItem);

        afterCommit(() -> trySendLowStockEvent(saved));

        return inventoryMapper.fromInventoryItem(saved);
    }

    private void trySendLowStockEvent(InventoryItem item) {
        try {
            sendLowStockEvent(item);
        } catch (JsonProcessingException e) {
            log.warn("Failed to publish low-stock event", e);
        }
    }

    private void sendLowStockEvent(InventoryItem item) throws JsonProcessingException {
        Integer qty = item.getQuantity();
        Integer threshold = item.getThreshold();

        // If any is null, skip publishing
        if (qty == null || threshold == null) return;
        if (qty >= threshold) return;

        String eventJson = objectMapper.writeValueAsString(
                Map.of(
                        "itemId", item.getId(),
                        "itemName", item.getName(),
                        "quantity", qty,
                        "threshold", threshold
                )
        );

        kafkaTemplate.send(TOPIC, eventJson)
                .whenComplete((result, ex) -> {
                    if (ex == null) log.info("Kafka event sent: {}", eventJson);
                    else log.error("Kafka send failed", ex);
                });
    }

    // DELETE
    @Transactional
    public boolean deleteInventoryItem(Long inventoryId) {
        try {
            inventoryRepository.deleteById(inventoryId);
            return true;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return false;
        }
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
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 200); // cap size
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("name").ascending());
        Page<InventoryItem> result = inventoryRepository.searchAndFilter(category, keyword, pageable);
        return result.map(inventoryMapper::fromInventoryItem);
    }

    private void validateRequired(InventoryRequest request) {
        if (request == null) throw new IllegalArgumentException("Request cannot be null");
        if (request.getCategory() == null || request.getCategory().isBlank())
            throw new IllegalArgumentException("Category is required");
        if (request.getUser_id() == null)
            throw new IllegalArgumentException("user_id is required");
    }

    /**
     * Ensures a Category exists for the given name.
     * Handles concurrent creation via unique constraint on categories.name.
     */
    private Category ensureCategory(String categoryName) {
        Category existing = categoryRepository.findByName(categoryName);
        if (existing != null) return existing;

        try {
            Category created = new Category();
            created.setName(categoryName);
            return categoryRepository.save(created);
        } catch (DataIntegrityViolationException e) {
            // Another thread may have inserted the same category concurrently
            Category retry = categoryRepository.findByName(categoryName);
            if (retry != null) return retry;
            throw e;
        }
    }

    /** Run a task after the current transaction successfully commits. */
    private static void afterCommit(Runnable r) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { r.run(); }
            });
        } else {
            // No TX; just run
            r.run();
        }
    }

    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(inventoryMapper::fromInventoryItem)
                .toList();
    }

}
