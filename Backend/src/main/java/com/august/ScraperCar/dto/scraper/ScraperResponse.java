package com.august.ScraperCar.dto.scraper;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ScraperResponse {

    @JsonProperty("total")
    private Integer total;

    @JsonProperty("resultado")
    private List<AnuncioDTO> resultado;

}

