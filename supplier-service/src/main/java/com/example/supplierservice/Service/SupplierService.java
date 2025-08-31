package com.example.supplierservice.Service;

import com.example.supplierservice.Dto.SupplierRequest;
import com.example.supplierservice.Dto.SupplierResponse;
import com.example.supplierservice.Entity.Supplier;
import com.example.supplierservice.Exception.NotFoundException;
import com.example.supplierservice.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierResponse create(SupplierRequest req) {
        Supplier s = Supplier.builder()
                .userId(req.getUserId())
                .supplierName(req.getSupplierName())
                .supplierTel(req.getSupplierTel())
                .address(req.getAddress())
                .supplierEmail(req.getSupplierEmail())
                .build();
        Supplier saved = supplierRepository.save(s);
        return toResponse(saved);
    }

    public SupplierResponse get(Long id) {
        return supplierRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Supplier not found for id=" + id));
    }

    public List<SupplierResponse> listByUser(Long userId) {
        return supplierRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SupplierResponse> listAll() {
        return supplierRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier not found for id=" + id));

        s.setUserId(req.getUserId());
        s.setSupplierName(req.getSupplierName());
        s.setSupplierTel(req.getSupplierTel());
        s.setAddress(req.getAddress());
        s.setSupplierEmail(req.getSupplierEmail());

        return toResponse(supplierRepository.save(s));
    }

    public void delete(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new NotFoundException("Supplier not found for id=" + id);
        }
        supplierRepository.deleteById(id);
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .supplierName(s.getSupplierName())
                .supplierTel(s.getSupplierTel())
                .address(s.getAddress())
                .supplierEmail(s.getSupplierEmail())
                .createdDate(s.getCreatedDate())
                .build();
    }
}
