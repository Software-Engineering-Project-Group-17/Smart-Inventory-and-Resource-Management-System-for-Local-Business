package com.thivinu.inventoryapi.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CategoryResponse(
        Long id,
        @JsonProperty("category_name") String name,
        @JsonProperty("category_image_url") String imageUrl
) {}