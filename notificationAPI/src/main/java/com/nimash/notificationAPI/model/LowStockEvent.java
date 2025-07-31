package com.nimash.notificationAPI.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
public class LowStockEvent {
    private Long itemId;
    private String itemName;
    private int quantity;
    private int threshold;

    public String getItemName() { return itemName; }
    public int getQuantity() { return quantity; }
    public int getThreshold() { return threshold; }



}
