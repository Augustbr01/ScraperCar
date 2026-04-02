package com.august.ScraperCar.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class VeiculoDataConfig {
    @Bean
    public JsonNode vehicleData(ObjectMapper objectMapper) throws IOException {
        ClassPathResource resource = new ClassPathResource("veiculos.json");
        return objectMapper.readTree(resource.getInputStream());
    }
}