package com.thivinu.inventoryapi.Exception;

import lombok.Data;
import lombok.EqualsAndHashCode;
@EqualsAndHashCode(callSuper = true)
@Data

public class InventoryNotFoundException extends RuntimeException{
    private final String msg;
}