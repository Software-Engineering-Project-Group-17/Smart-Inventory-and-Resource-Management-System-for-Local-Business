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
        if(request.getId()!=null){
            if(!(id.equals(request.getId()))){
                throw new RuntimeException("doesn't match with the provided Id");
            }
        }
        Category category = categoryRepository.findByName(request.getCategory());
        if(category!=null){
            if(existingItem.getCategory().getId().equals(category.getId())) {
                System.out.println("category doesn't change");
            }
            else{
                System.out.println("category changed the existing inventory");
            }
        }
        else{
            category = new Category(request.getCategory());
            categoryRepository.save(category);
        }
        // now category is ok
        mergeInventory(existingItem,request,category);
        // ✅ Check if low stock
        if (existingItem.getQuantity() < existingItem.getThreshold()) {
            ObjectMapper objectMapper = new ObjectMapper();

            // Create a Map to send only necessary fields
            Map<String, Object> eventMap = new HashMap<>();
            eventMap.put("itemId", existingItem.getId());
            eventMap.put("itemName", existingItem.getName());
            eventMap.put("quantity", existingItem.getQuantity());
            eventMap.put("threshold", existingItem.getThreshold());

            String eventJson = objectMapper.writeValueAsString(eventMap);

            kafkaTemplate.send("low-stock-topic", eventJson);


        }

        existingItem=inventoryRepository.save(existingItem);

        return existingItem;
    }

    private void mergeInventory(InventoryItem inventory, InventoryRequest request,Category category) {

        if (StringUtils.isNotBlank(request.getName())) {
            inventory.setName(request.getName());
        }
        if (StringUtils.isNotBlank(request.getSupplier())) {
            inventory.setSupplier(request.getSupplier());
        }
        if (request.getQuantity() >= 0) {
            inventory.setQuantity(request.getQuantity());
        }
        if (request.getPrice() > 0) {
            inventory.setPrice(request.getPrice());
        }
        if (request.getThreshold() > 0) {
            inventory.setThreshold(request.getThreshold());
        }
        if (category != null) {
            inventory.setCategory(category);
        }

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
