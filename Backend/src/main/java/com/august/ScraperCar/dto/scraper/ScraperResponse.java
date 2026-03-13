package com.august.ScraperCar.dto.scraper;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ScraperResponse {

    @JsonProperty("Total")
    private Integer total;

    @JsonProperty("Resultado")
    private List<AnuncioDTO> resultado;

}

