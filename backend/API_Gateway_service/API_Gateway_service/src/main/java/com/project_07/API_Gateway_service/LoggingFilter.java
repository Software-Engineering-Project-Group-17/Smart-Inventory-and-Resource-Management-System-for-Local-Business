package com.project_07.API_Gateway_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * A global logging filter that logs all incoming HTTP requests through the API Gateway.
 */
@Component
@Order(1)  // You can set order if you have multiple filters
public class LoggingFilter implements GlobalFilter {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String method = String.valueOf(exchange.getRequest().getMethod());
        String path = exchange.getRequest().getURI().getPath();
        String query = exchange.getRequest().getURI().getQuery();
        String fullRequest = method + " " + path + (query != null ? "?" + query : "");

        log.info("[API Gateway] Incoming Request: {}", fullRequest);

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() ->
                        log.info("[API Gateway] Response sent for: {}", fullRequest)
                ));
    }
}
