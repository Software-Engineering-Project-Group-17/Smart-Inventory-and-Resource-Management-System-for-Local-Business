package com.example.customerservice.Exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
