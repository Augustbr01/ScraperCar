package com.august.ScraperCar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient scraperClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
