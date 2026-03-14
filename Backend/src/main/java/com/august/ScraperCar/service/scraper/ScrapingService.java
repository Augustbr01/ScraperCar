package com.august.ScraperCar.service.scraper;

import com.august.ScraperCar.dto.scraper.AnuncioDTO;
import com.august.ScraperCar.dto.scraper.ScraperRequest;
import com.august.ScraperCar.dto.scraper.ScraperResponse;
import com.august.ScraperCar.model.ScrapeCacheModel;
import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.repository.ScrapeCacheRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ScrapingService {
    private final ScraperService scraperService;
    private final ScrapeCacheRepository scrapeCacheRepository;
    private final ObjectMapper objectMapper;

    public ScrapingService(ScraperService scraperService, ScrapeCacheRepository scrapeCacheRepository,  ObjectMapper objectMapper) {
        this.scraperService = scraperService;
        this.objectMapper = objectMapper;
        this.scrapeCacheRepository = scrapeCacheRepository;
    }

    public List<AnuncioDTO> getFreshAnuncios(SharedSearchJobModel job) {
        String veiculoKey = job.getVeiculoKey();

        Optional<ScrapeCacheModel> cacheOpt = scrapeCacheRepository.findByVeiculoKey(veiculoKey);

        if (cacheOpt.isPresent() && !isCacheExpirado(cacheOpt.get(), job.getIntervalo())) {
             return parseCache(cacheOpt.get().getResultado());
        }

        ScraperRequest request = buildRequest(job);
        ScraperResponse response = scraperService.scrapeCarro(request);

        saveCache(veiculoKey, response);
        return response.getResultado();
    }

    public ScraperRequest buildRequest(SharedSearchJobModel job) {
        return new ScraperRequest(
                null,
                1,
                job.getMarca().getId(),
                job.getModelo(),
                job.getVersao(),
                job.getPrecoMin().intValue(),
                job.getPrecoMax().intValue(),
                job.getAnoMin(),
                job.getAnoMax(),
                job.getKmInicio(),
                job.getKmFinal()
        );
    }

    private boolean isCacheExpirado(ScrapeCacheModel cache, int intervalo) {
        return Duration.between(cache.getScrapedAt(), LocalDateTime.now())
                .compareTo(Duration.ofMinutes(intervalo)) > 0;
    }

    private void saveCache(String veiculoKey, ScraperResponse scraperResponse) {

        try {
            String json = objectMapper.writeValueAsString(scraperResponse);
            ScrapeCacheModel cache = scrapeCacheRepository.findByVeiculoKey(veiculoKey)
                    .orElse(new ScrapeCacheModel());
            cache.setScrapedAt(LocalDateTime.now());
            cache.setVeiculoKey(veiculoKey);
            cache.setResultado(json);
            scrapeCacheRepository.save(cache);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao salvar cache", e);
        }
    }

    private List<AnuncioDTO> parseCache(String json) {
        try {
            ScraperResponse scraperResponse = objectMapper.readValue(json, ScraperResponse.class);
            return scraperResponse.getResultado();
        } catch (Exception e) {
            return List.of();
        }
    }


}
