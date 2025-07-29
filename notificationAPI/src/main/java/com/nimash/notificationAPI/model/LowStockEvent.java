package com.nimash.notificationAPI.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LowStockEvent {
    private Long itemId;
    private String itemName;
    private int quantity;
    private int threshold;
}
