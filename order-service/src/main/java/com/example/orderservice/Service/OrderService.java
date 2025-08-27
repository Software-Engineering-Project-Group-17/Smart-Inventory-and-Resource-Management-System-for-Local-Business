package com.example.orderservice.Service;

import com.example.orderservice.Dto.CreateOrderRequest;
import com.example.orderservice.Dto.InvoiceResponse;
import com.example.orderservice.Dto.OrderResponse;
import com.example.orderservice.Entity.*;
import com.example.orderservice.Exception.NotFoundException;
import com.example.orderservice.Repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public OrderResponse create(CreateOrderRequest req) {
        Order order = new Order();
        order.setCustomerId(req.customerId());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus("PAID".equalsIgnoreCase(req.payment()) ? PaymentStatus.PAID : PaymentStatus.UNPAID);
        order.setCreatedAt(Instant.now());

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.Item it : req.items()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setItemId(it.itemId());
            oi.setItemName(it.itemName());
            oi.setUnitPrice(it.unitPrice());
            oi.setQuantity(it.quantity());
            oi.setSubtotal(it.unitPrice().multiply(BigDecimal.valueOf(it.quantity())));
            order.getItems().add(oi);
            total = total.add(oi.getSubtotal());
        }
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        // TODO: FR3.3 reduce inventory in Inventory service via event/REST call

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> list() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order o = find(id);
        o.setStatus(status);
        return toResponse(orderRepository.save(o));
    }

    @Transactional
    public OrderResponse updatePayment(Long id, PaymentStatus ps) {
        Order o = find(id);
        o.setPaymentStatus(ps);
        return toResponse(orderRepository.save(o));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse invoice(Long id) {
        Order o = find(id);
        String inv = "INV-" + o.getId();
        return new InvoiceResponse(
                o.getId(),
                inv,
                Instant.now(),
                o.getTotalAmount(),
                o.getItems().stream().map(i -> new InvoiceResponse.Line(i.getItemName(), i.getQuantity(), i.getUnitPrice(), i.getSubtotal())).collect(Collectors.toList())
        );
    }

    private Order find(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order %d not found".formatted(id)));
    }

    private OrderResponse toResponse(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getCustomerId(),
                o.getStatus().name(),
                o.getPaymentStatus().name(),
                o.getTotalAmount(),
                o.getCreatedAt(),
                o.getItems().stream().map(i -> new OrderResponse.Item(i.getId(), i.getItemId(), i.getItemName(), i.getUnitPrice(), i.getQuantity(), i.getSubtotal())).toList()
        );
    }
}
