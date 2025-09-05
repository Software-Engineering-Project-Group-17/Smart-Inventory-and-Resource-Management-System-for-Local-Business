package com.thivinu.inventoryapi.Service;

import com.thivinu.inventoryapi.Dto.CategoryRequest;
import com.thivinu.inventoryapi.Entity.Category;
import com.thivinu.inventoryapi.Mapper.CategoryMapper;
import com.thivinu.inventoryapi.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public Category addCategory(CategoryRequest request) {
        Category category = categoryMapper.toEntity(request);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        System.out.println("hi");
        return categoryRepository.findAll();
    }

    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
}
