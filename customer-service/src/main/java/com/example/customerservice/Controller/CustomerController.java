package com.example.customerservice.Controller;

import com.example.customerservice.Dto.CustomerRequest;
import com.example.customerservice.Dto.CustomerResponse;
import com.example.customerservice.Dto.OrderSummary;
import com.example.customerservice.Service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest r){
        return ResponseEntity.ok(service.create(r));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest r){
        return ResponseEntity.ok(service.update(id, r));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long id){
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> del(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> list(@RequestParam(required = false) String q){
        if(q!=null && !q.isBlank()) return ResponseEntity.ok(service.search(q));
        return ResponseEntity.ok(service.list());
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrderSummary>> orders(@PathVariable Long id){
        return ResponseEntity.ok(service.orders(id));
    }
}
