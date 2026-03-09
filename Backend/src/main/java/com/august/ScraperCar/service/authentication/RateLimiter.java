package com.august.ScraperCar.service.authentication;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String key) {
        System.out.println("RateLimiter chamado para: " + key);
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket());
        boolean allowed = bucket.tryConsume(1);
        System.out.println("Bucket tokens disponíveis: " + bucket.getAvailableTokens());
        return allowed;
    }

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)  // SÓ 3 pra testar rápido!
                .refillIntervally(10, Duration.ofMinutes(2))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
