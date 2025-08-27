package com.example.supplierservice.Service;

import com.example.supplierservice.Dto.PurchaseOrderRequest;
import com.example.supplierservice.Dto.PurchaseOrderResponse;
import com.example.supplierservice.Entity.*;
import com.example.supplierservice.Exception.NotFoundException;
import com.example.supplierservice.Repository.PurchaseOrderRepository;
import com.example.supplierservice.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service @RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest r){
        Supplier s = supplierRepo.findById(r.supplierId()).orElseThrow(() -> new NotFoundException("Supplier %d not found".formatted(r.supplierId())));
        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(s);
        po.setCreatedAt(Instant.now());
        po.setStatus(PurchaseOrderStatus.CREATED);

        for (PurchaseOrderRequest.Line l : r.lines()){
            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setItemId(l.itemId());
            line.setItemName(l.itemName());
            line.setQuantity(l.quantity());
            line.setUnitPrice(l.unitPrice());
            po.getLines().add(line);
        }
        po = poRepo.save(po);
        return toResponse(po);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse get(Long id){ return toResponse(find(id)); }

    @Transactional
    public PurchaseOrderResponse setStatus(Long id, PurchaseOrderStatus status){
        PurchaseOrder po = find(id);
        po.setStatus(status);
        return toResponse(poRepo.save(po));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> list(){ return poRepo.findAll().stream().map(this::toResponse).toList(); }

    private PurchaseOrder find(Long id){ return poRepo.findById(id).orElseThrow(() -> new NotFoundException("PO %d not found".formatted(id))); }

    private PurchaseOrderResponse toResponse(PurchaseOrder po){
        BigDecimal total = po.getLines().stream()
                .map(l -> l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PurchaseOrderResponse(
                po.getId(),
                po.getSupplier().getId(),
                po.getStatus().name(),
                po.getCreatedAt(),
                po.getLines().stream().map(l -> new PurchaseOrderResponse.Line(l.getId(), l.getItemId(), l.getItemName(), l.getQuantity(), l.getUnitPrice())).toList(),
                total
        );
    }
}
