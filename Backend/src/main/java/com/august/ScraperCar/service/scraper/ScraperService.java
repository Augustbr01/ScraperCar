package com.august.ScraperCar.service.scraper;

import com.august.ScraperCar.dto.scraper.ScraperRequest;
import com.august.ScraperCar.dto.scraper.ScraperResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ScraperService {
    private final WebClient scraperClient;

    public ScraperService(@Qualifier("scraperClient") WebClient scraperClient) {
        this.scraperClient = scraperClient;
    }

    public ScraperResponse scrapeCarro(ScraperRequest request) {
        System.out.println("chegou no serice do scraper");
        System.out.println(request);
        return scraperClient
                .post()
                .uri("/buscar")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ScraperResponse.class)
                .block();
    }
}
