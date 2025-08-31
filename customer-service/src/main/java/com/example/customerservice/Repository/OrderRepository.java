package com.example.customerservice.Repository;

import com.example.customerservice.Entity.Order;
import com.example.customerservice.Entity.OrderStatus;
import com.example.customerservice.Entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer_Id(Long customerId);
    List<Order> findByBranchId(Integer branchId);
    List<Order> findByOrderStatus(OrderStatus status);
    List<Order> findByPaymentStatus(PaymentStatus status);
    List<Order> findByBranchIdAndOrderStatus(Integer branchId, OrderStatus status);
}
