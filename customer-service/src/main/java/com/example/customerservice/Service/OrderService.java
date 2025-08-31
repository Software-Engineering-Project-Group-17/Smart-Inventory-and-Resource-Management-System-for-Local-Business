package com.example.customerservice.Service;

import com.example.customerservice.Dto.BranchResolveResponse;
import com.example.customerservice.Dto.*;
import com.example.customerservice.Entity.*;
import com.example.customerservice.Exception.BadRequestException;
import com.example.customerservice.Exception.NotFoundException;
import com.example.customerservice.Repository.CustomerRepository;
import com.example.customerservice.Repository.OrderItemRepository;
import com.example.customerservice.Repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService{

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final BranchResolverService branchResolverService;

    @Transactional
    public OrderResponse create(OrderCreateRequest req) {
        // resolve branch from userId
        BranchResolveResponse branch = branchResolverService.resolveBranch(req.getUserId());
        if (branch == null || branch.branchId() == null) {
            throw new BadRequestException("Branch service did not return a branchId for userId=" + req.getUserId());
        }

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new NotFoundException("Customer not found for id=" + req.getCustomerId()));

        // build order skeleton
        Order order = Order.builder()
                .customer(customer)
                .orderStatus(req.getOrderStatus() != null ? req.getOrderStatus() : OrderStatus.PENDING)
                .paymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : PaymentStatus.UNPAID)
                .branchId(branch.branchId())
                .build();

        // attach items & compute totals from inventory prices
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> toPersistItems = new ArrayList<>();
        List<OrderItemSummary> responseItems = new ArrayList<>();

        for (OrderItemRequest ir : req.getItems()) {
            InventoryItem inv = inventoryRepository.findById(ir.getInventoryId())
                    .orElseThrow(() -> new NotFoundException("Inventory not found for id=" + ir.getInventoryId()));

            BigDecimal unit = BigDecimal.valueOf(inv.getSellingPricePerUnit());
            BigDecimal line = unit.multiply(BigDecimal.valueOf(ir.getQuantity()));

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .inventoryId(ir.getInventoryId())
                    .quantity(ir.getQuantity())
                    .build();

            toPersistItems.add(oi);
            responseItems.add(OrderItemSummary.builder()
                    .id(null) // filled after save
                    .inventoryId(ir.getInventoryId())
                    .quantity(ir.getQuantity())
                    .lineAmount(line)
                    .build());

            total = total.add(line);
        }

        order.setTotalAmount(total);

        // persist order + items
        Order saved = orderRepository.save(order);
        for (OrderItem oi : toPersistItems) {
            oi.setOrder(saved);
        }
        List<OrderItem> savedItems = orderItemRepository.saveAll(toPersistItems);

        // fill generated ids into response summaries
        for (int i = 0; i < savedItems.size(); i++) {
            responseItems.set(i, OrderItemSummary.builder()
                    .id(savedItems.get(i).getId())
                    .inventoryId(responseItems.get(i).inventoryId())
                    .quantity(responseItems.get(i).quantity())
                    .lineAmount(responseItems.get(i).lineAmount())
                    .build());
        }

        return toResponse(saved, responseItems);
    }

    public OrderResponse get(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found for id=" + id));

        List<OrderItemSummary> items = orderItemRepository.findByOrder_Id(order.getId()).stream()
                .map(oi -> OrderItemSummary.builder()
                        .id(oi.getId())
                        .inventoryId(oi.getInventoryId())
                        .quantity(oi.getQuantity())
                        // lineAmount optional on fetch (would need inventory lookup)
                        .lineAmount(null)
                        .build())
                .toList();

        return toResponse(order, items);
    }

    public List<OrderResponse> list(Long customerId, Integer branchId, OrderStatus status) {
        List<Order> orders;
        if (customerId != null) {
            orders = orderRepository.findByCustomer_Id(customerId);
        } else if (branchId != null && status != null) {
            orders = orderRepository.findByBranchIdAndOrderStatus(branchId, status);
        } else if (branchId != null) {
            orders = orderRepository.findByBranchId(branchId);
        } else if (status != null) {
            orders = orderRepository.findByOrderStatus(status);
        } else {
            orders = orderRepository.findAll();
        }

        return orders.stream()
                .map(o -> toResponse(o, null)) // items omitted for list for brevity
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found for id=" + id));
        order.setOrderStatus(status);
        return toResponse(orderRepository.save(order), null);
    }

    @Transactional
    public OrderResponse updatePayment(Long id, PaymentStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found for id=" + id));
        order.setPaymentStatus(status);
        return toResponse(orderRepository.save(order), null);
    }

    @Transactional
    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Order not found for id=" + id);
        }
        orderRepository.deleteById(id);
    }

    private OrderResponse toResponse(Order o, List<OrderItemSummary> items) {
        return OrderResponse.builder()
                .id(o.getId())
                .customerId(o.getCustomer().getId())
                .orderStatus(o.getOrderStatus())
                .paymentStatus(o.getPaymentStatus())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .branchId(o.getBranchId())
                .items(items)
                .build();
    }
}
