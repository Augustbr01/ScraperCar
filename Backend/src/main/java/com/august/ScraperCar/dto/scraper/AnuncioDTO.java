package com.august.ScraperCar.dto.scraper;

import lombok.Data;

@Data
public class AnuncioDTO {
        private String busca;

        private String id;

        private String modelo;

        private String ano;

        private String cor;

        private String combustivel;

        private String km;

        private String preco;

        private String cidade;

        private String link;

        private String dataEncontrado;
}
