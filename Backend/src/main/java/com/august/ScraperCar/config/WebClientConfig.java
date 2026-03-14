package com.august.ScraperCar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class WebClientConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())  // LocalDateTime
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Bean
    public WebClient scraperClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean(name = "wppClient")
    public WebClient wppClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:21465")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
