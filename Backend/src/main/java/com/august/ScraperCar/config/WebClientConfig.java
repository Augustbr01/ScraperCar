package com.august.ScraperCar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class WebClientConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
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
