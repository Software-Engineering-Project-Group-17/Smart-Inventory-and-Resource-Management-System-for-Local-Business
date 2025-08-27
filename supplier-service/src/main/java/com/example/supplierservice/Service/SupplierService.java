package com.example.supplierservice.Service;

import com.example.supplierservice.Dto.SupplierRequest;
import com.example.supplierservice.Dto.SupplierResponse;
import com.example.supplierservice.Entity.Supplier;
import com.example.supplierservice.Exception.NotFoundException;
import com.example.supplierservice.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service @RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository repo;

    @Transactional
    public SupplierResponse create(SupplierRequest r){
        Supplier s = Supplier.builder().name(r.name()).contactEmail(r.contactEmail()).phone(r.phone()).address(r.address()).build();
        return toResponse(repo.save(s));
    }
    @Transactional
    public SupplierResponse update(Long id, SupplierRequest r){
        Supplier s = find(id);
        s.setName(r.name()); s.setContactEmail(r.contactEmail()); s.setPhone(r.phone()); s.setAddress(r.address());
        return toResponse(repo.save(s));
    }
    @Transactional(readOnly = true)
    public SupplierResponse get(Long id){ return toResponse(find(id)); }
    @Transactional(readOnly = true)
    public List<SupplierResponse> list(){ return repo.findAll().stream().map(this::toResponse).toList(); }
    @Transactional public void delete(Long id){ repo.delete(find(id)); }

    private Supplier find(Long id){ return repo.findById(id).orElseThrow(() -> new NotFoundException("Supplier %d not found".formatted(id))); }
    private SupplierResponse toResponse(Supplier s){ return new SupplierResponse(s.getId(), s.getName(), s.getContactEmail(), s.getPhone(), s.getAddress()); }
}
