package com.example.supplierservice.Service;

import com.example.supplierservice.Dto.BranchResolveResponse;
import com.example.supplierservice.Dto.SupplierOrderRequest;
import com.example.supplierservice.Dto.SupplierOrderResponse;
import com.example.supplierservice.Entity.SupplierItem;
import com.example.supplierservice.Entity.SupplierOrder;
import com.example.supplierservice.Entity.SupplierOrderStatus;
import com.example.supplierservice.Exception.NotFoundException;
import com.example.supplierservice.Repository.SupplierItemRepository;
import com.example.supplierservice.Repository.SupplierOrderRepository;
import com.example.supplierservice.Service.BranchResolverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierOrderService {

    private final SupplierOrderRepository orderRepository;
    private final SupplierItemRepository itemRepository;
    private final BranchResolverService branchResolverService;

    public SupplierOrderResponse create(SupplierOrderRequest req) {
        // resolve branchId from userId
        BranchResolveResponse branch = branchResolverService.resolveBranch(req.getUserId());
        if (branch == null || branch.branchId() == null) {
            throw new IllegalArgumentException("Branch service did not return a branchId for userId=" + req.getUserId());
        }

        SupplierItem item = itemRepository.findById(req.getSupplierItemId())
                .orElseThrow(() -> new NotFoundException("Supplier item not found for id=" + req.getSupplierItemId()));

        SupplierOrder order = SupplierOrder.builder()
                .supplierItem(item)
                .quantity(req.getQuantity())
                .status(req.getStatus() != null ? req.getStatus() : SupplierOrderStatus.PENDING)
                .branchId(branch.branchId())
                .build();

        return toResponse(orderRepository.save(order));
    }

    public SupplierOrderResponse get(Long id) {
        return orderRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Supplier order not found for id=" + id));
    }

    public List<SupplierOrderResponse> list(Integer branchId, SupplierOrderStatus status) {
        if (branchId != null && status != null) {
            return orderRepository.findByBranchIdAndStatus(branchId, status).stream().map(this::toResponse).toList();
        } else if (branchId != null) {
            return orderRepository.findByBranchId(branchId).stream().map(this::toResponse).toList();
        } else if (status != null) {
            return orderRepository.findByStatus(status).stream().map(this::toResponse).toList();
        }
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    public SupplierOrderResponse updateStatus(Long id, SupplierOrderStatus status) {
        SupplierOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier order not found for id=" + id));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Supplier order not found for id=" + id);
        }
        orderRepository.deleteById(id);
    }

    private SupplierOrderResponse toResponse(SupplierOrder order) {
        return SupplierOrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .quantity(order.getQuantity())
                .supplierItemId(order.getSupplierItem().getId())
                .branchId(order.getBranchId())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
