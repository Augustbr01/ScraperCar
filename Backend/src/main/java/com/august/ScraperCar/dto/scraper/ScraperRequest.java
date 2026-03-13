package com.august.ScraperCar.dto.scraper;

public record ScraperRequest(String nome,
                             int tipo,
                             int marca,
                             String string,
                             String versao,
                             int valorinicio,
                             int valorfim,
                             int faixaano1,
                             int faixaano2,
                             String kminicio,
                             String kmfim)
{
}
