package com.thivinu.inventoryapi.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryRequest {
    private Long id;

    // Accepts JSON as {"category_name": "..."} while using 'name' in Java
    @NotBlank(message = "Category name is required")
    @JsonProperty("category_name")
    private String name;
}
