package com.thivinu.inventoryapi.Mapper;

import com.thivinu.inventoryapi.Dto.CategoryRequest;
import com.thivinu.inventoryapi.Dto.CategoryResponse;
import com.thivinu.inventoryapi.Entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    // ✅ Convert CategoryRequest (DTO) → Category (Entity)
    public Category toCategory(CategoryRequest request) {
        if (request == null) return null;
        Category category = new Category();
        category.setName(request.getName());
        return category;
    }

    // ✅ Convert Category (Entity) → CategoryResponse (DTO)
    public CategoryResponse fromCategory(Category category) {
        if (category == null) return null;
        return new CategoryResponse(category.getId(), category.getName());
    }
}
