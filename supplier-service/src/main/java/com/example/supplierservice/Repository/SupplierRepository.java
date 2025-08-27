package com.example.supplierservice.Repository;

import com.example.supplierservice.Entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SupplierRepository extends JpaRepository<Supplier, Long> {}
