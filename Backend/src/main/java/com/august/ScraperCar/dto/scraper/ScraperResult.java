package com.august.ScraperCar.dto.scraper;

import java.util.List;

public record ScraperResult(List<AnuncioDTO> anuncios, boolean isFreshScrape) {
    
}
