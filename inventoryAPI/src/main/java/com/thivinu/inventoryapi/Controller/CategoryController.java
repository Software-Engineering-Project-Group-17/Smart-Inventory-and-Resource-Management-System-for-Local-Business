package com.thivinu.inventoryapi.Controller;

import com.thivinu.inventoryapi.Dto.CategoryRequest;
import com.thivinu.inventoryapi.Dto.CategoryResponse;
import com.thivinu.inventoryapi.Entity.Category;
import com.thivinu.inventoryapi.Mapper.CategoryMapper;
import com.thivinu.inventoryapi.Service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @PostMapping("/add")
    public ResponseEntity<CategoryResponse> addCategory(@Valid @RequestBody CategoryRequest request) {
        Category saved = categoryService.addCategory(request);
        return ResponseEntity.ok(categoryMapper.toResponse(saved));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> responses = categoryService.getAllCategories()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<CategoryResponse> getByName(@PathVariable String name) {
        Category category = categoryService.getCategoryByName(name);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(categoryMapper.toResponse(category));
    }

    @GetMapping("/by-id/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(categoryMapper.toResponse(category));
    }
}
