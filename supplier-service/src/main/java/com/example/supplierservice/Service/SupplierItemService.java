package com.example.supplierservice.Service;

import com.example.supplierservice.Dto.SupplierItemRequest;
import com.example.supplierservice.Dto.SupplierItemResponse;
import com.example.supplierservice.Entity.Supplier;
import com.example.supplierservice.Entity.SupplierItem;
import com.example.supplierservice.Exception.NotFoundException;
import com.example.supplierservice.Repository.SupplierItemRepository;
import com.example.supplierservice.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierItemService {

    private final SupplierItemRepository itemRepository;
    private final SupplierRepository supplierRepository;

    public SupplierItemResponse create(SupplierItemRequest req) {
        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new NotFoundException("Supplier not found for id=" + req.getSupplierId()));

        SupplierItem item = SupplierItem.builder()
                .supplier(supplier)
                .itemName(req.getItemName())
                .itemPrice(req.getItemPrice())
                .build();
        return toResponse(itemRepository.save(item));
    }

    public SupplierItemResponse get(Long id) {
        return itemRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Supplier item not found for id=" + id));
    }

    public List<SupplierItemResponse> listAll() {
        return itemRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<SupplierItemResponse> listBySupplier(Long supplierId) {
        return itemRepository.findBySupplier_Id(supplierId).stream().map(this::toResponse).toList();
    }

    public SupplierItemResponse update(Long id, SupplierItemRequest req) {
        SupplierItem item = itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier item not found for id=" + id));

        if (!item.getSupplier().getId().equals(req.getSupplierId())) {
            Supplier supplier = supplierRepository.findById(req.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier not found for id=" + req.getSupplierId()));
            item.setSupplier(supplier);
        }
        item.setItemName(req.getItemName());
        item.setItemPrice(req.getItemPrice());

        return toResponse(itemRepository.save(item));
    }

    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new NotFoundException("Supplier item not found for id=" + id);
        }
        itemRepository.deleteById(id);
    }

    private SupplierItemResponse toResponse(SupplierItem item) {
        return SupplierItemResponse.builder()
                .id(item.getId())
                .supplierId(item.getSupplier().getId())
                .itemName(item.getItemName())
                .itemPrice(item.getItemPrice())
                .build();
    }
}
