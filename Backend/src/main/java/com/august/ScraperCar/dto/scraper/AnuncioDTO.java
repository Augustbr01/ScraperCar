package com.august.ScraperCar.dto.scraper;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AnuncioDTO {
        private String busca;

        private String id;

        private String modelo;

        private String ano;

        private String cor;

        private String combustivel;

        private String km;

        private BigDecimal preco;

        private String cidade;

        private String link;

        private String dataEncontrado;
}
