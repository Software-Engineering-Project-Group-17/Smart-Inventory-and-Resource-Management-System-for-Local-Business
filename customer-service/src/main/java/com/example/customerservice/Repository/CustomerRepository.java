package com.example.customerservice.Repository;

import com.example.customerservice.Entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("select c from Customer c where lower(c.name) like lower(concat('%', ?1, '%')) or lower(c.email) like lower(concat('%', ?1, '%'))")
    List<Customer> search(String q);
}
