package com.thivinu.inventoryapi.Mapper;

import com.thivinu.inventoryapi.Dto.CategoryRequest;
import com.thivinu.inventoryapi.Dto.CategoryResponse;
import com.thivinu.inventoryapi.Entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {
        if (request == null) return null;
        Category category = new Category();
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());
        // 'id' is generated; ignore request.id for create
        return category;
    }

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getImageUrl()
        );
    }
}
