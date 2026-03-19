package com.august.ScraperCar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class WebClientConfig {

    @Value("${wpp.url}")
    private String wppUrl;

    @Value("${scraper.url}")
    private String scraperurl;

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public WebClient scraperClient() {
        return WebClient.builder()
                .baseUrl(scraperurl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean(name = "wppClient")
    public WebClient wppClient() {
        return WebClient.builder()
                .baseUrl(wppUrl)
                .defaultHeader("Content-Type", "application/json")
                .codecs(config -> config.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
}
