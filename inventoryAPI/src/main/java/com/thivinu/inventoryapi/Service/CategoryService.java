package com.thivinu.inventoryapi.Service;

import com.thivinu.inventoryapi.Entity.Category;
import com.thivinu.inventoryapi.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // ✅ Add new category
    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    // ✅ Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // ✅ Get category by name
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
}
