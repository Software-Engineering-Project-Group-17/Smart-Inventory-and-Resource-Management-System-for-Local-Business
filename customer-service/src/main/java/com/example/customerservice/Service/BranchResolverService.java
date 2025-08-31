package com.example.customerservice.Service;

import com.example.customerservice.Dto.BranchResolveResponse;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class BranchResolverService {
    private final WebClient branchWebClient;

    @Retry(name = "branchApi")
    @CircuitBreaker(name = "branchApi")
    public BranchResolveResponse resolveBranch(Long userId) {
        return branchWebClient.get()
                .uri(uri -> uri.path("/api/branches/resolve")
                        .queryParam("userId", userId)
                        .build())
                .retrieve()
                .bodyToMono(BranchResolveResponse.class)
                .block();
    }
}
