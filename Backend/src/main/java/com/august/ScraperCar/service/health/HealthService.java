package com.august.ScraperCar.service.health;

import com.august.ScraperCar.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;


@Service
public class HealthService {
    private final WebClient scraperClient;
    private final WebClient wppClient;

    public HealthService(WebClient scraperClient, WebClient wppClient) {
        this.scraperClient = scraperClient;
        this.wppClient = wppClient;
    }

    @Value("${wpp.token}")
    private String tokenWPP;

    @Value("${wpp.session}")
    private String wppSession;

    public boolean checkWorker() {
        try {
            scraperClient
                    .get()
                    .uri("/check")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (WebClientException e) {
            throw new BusinessException("Worker não esta funcionando!", 404);
        }
    }

    public boolean checkWPP() {
        try {
            wppClient
                    .get()
                    .uri("/api/" + wppSession + "/check-connection-session")
                    .header("Authorization", "Bearer " + tokenWPP)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (WebClientException e) {
            throw new BusinessException("WPP não esta conectado!", 404);
        }
    }
}
