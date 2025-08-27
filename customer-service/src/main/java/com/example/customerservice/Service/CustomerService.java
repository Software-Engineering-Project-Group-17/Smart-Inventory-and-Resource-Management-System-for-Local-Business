package com.example.customerservice.Service;

import com.example.customerservice.Dto.CustomerRequest;
import com.example.customerservice.Dto.CustomerResponse;
import com.example.customerservice.Dto.OrderSummary;
import com.example.customerservice.Entity.Customer;
import com.example.customerservice.Exception.NotFoundException;
import com.example.customerservice.Repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service @RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository repo;

    @Transactional
    public CustomerResponse create(CustomerRequest r){
        Customer c = Customer.builder()
                .name(r.name())
                .email(r.email())
                .phone(r.phone())
                .address(r.address())
                .loyaltyPoints(0)
                .createdAt(Instant.now())
                .build();
        return toResponse(repo.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest r){
        Customer c = find(id);
        c.setName(r.name());
        c.setEmail(r.email());
        c.setPhone(r.phone());
        c.setAddress(r.address());
        return toResponse(repo.save(c));
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Long id){ return toResponse(find(id)); }

    @Transactional(readOnly = true)
    public List<CustomerResponse> list(){ return repo.findAll().stream().map(this::toResponse).toList(); }

    @Transactional
    public void delete(Long id){ repo.delete(find(id)); }

    @Transactional(readOnly = true)
    public List<CustomerResponse> search(String q){ return repo.search(q).stream().map(this::toResponse).toList(); }

    // Placeholder: In a real system, call Order service via REST/Feign to fetch order history
    @Transactional(readOnly = true)
    public List<OrderSummary> orders(Long customerId){
        return List.of(); // TODO integrate with order-service
    }

    private Customer find(Long id){
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Customer %d not found".formatted(id)));
    }
    private CustomerResponse toResponse(Customer c){
        return new CustomerResponse(c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getAddress(), c.getLoyaltyPoints());
    }
}
