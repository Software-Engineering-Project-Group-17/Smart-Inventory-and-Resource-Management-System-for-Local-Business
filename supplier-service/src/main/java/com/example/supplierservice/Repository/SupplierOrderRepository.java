package com.example.supplierservice.Repository;

import com.example.supplierservice.Entity.SupplierOrder;
import com.example.supplierservice.Entity.SupplierOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierOrderRepository extends JpaRepository<SupplierOrder, Long> {
    List<SupplierOrder> findByBranchId(Integer branchId);
    List<SupplierOrder> findByStatus(SupplierOrderStatus status);
    List<SupplierOrder> findByBranchIdAndStatus(Integer branchId, SupplierOrderStatus status);
}
