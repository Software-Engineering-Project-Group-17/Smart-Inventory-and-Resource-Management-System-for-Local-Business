package com.example.customerservice.Service;

import com.example.customerservice.Dto.CustomerRequest;
import com.example.customerservice.Dto.CustomerRequest;
import com.example.customerservice.Dto.CustomerResponse;
import com.example.customerservice.Entity.Customer;
import com.example.customerservice.Exception.NotFoundException;
import com.example.customerservice.Repository.CustomerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponse create(@Valid CustomerRequest req) {
        Customer c = Customer.builder()
                .userId(req.getUserId())
                .customerName(req.getCustomerName())
                .customerTel(req.getCustomerTel())
                .address(req.getAddress())
                .customerEmail(req.getCustomerEmail())
                .loyaltyPoints(req.getLoyaltyPoints())
                .build();
        return toResponse(customerRepository.save(c));
    }

    public CustomerResponse get(Long id) {
        return customerRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Customer not found for id=" + id));
    }

    public List<CustomerResponse> list() {
        return customerRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<CustomerResponse> listByUser(Long userId) {
        return customerRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found for id=" + id));

        c.setUserId(req.getUserId());
        c.setCustomerName(req.getCustomerName());
        c.setCustomerTel(req.getCustomerTel());
        c.setAddress(req.getAddress());
        c.setCustomerEmail(req.getCustomerEmail());
        if (req.getLoyaltyPoints() != null) c.setLoyaltyPoints(req.getLoyaltyPoints());

        return toResponse(customerRepository.save(c));
    }

    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new NotFoundException("Customer not found for id=" + id);
        }
        customerRepository.deleteById(id);
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .customerName(c.getCustomerName())
                .customerTel(c.getCustomerTel())
                .address(c.getAddress())
                .loyaltyPoints(c.getLoyaltyPoints())
                .createdDate(c.getCreatedDate())
                .customerEmail(c.getCustomerEmail())
                .build();
    }
}
