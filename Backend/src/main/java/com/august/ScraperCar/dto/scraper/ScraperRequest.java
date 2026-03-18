package com.august.ScraperCar.dto.scraper;

import java.math.BigDecimal;

public record ScraperRequest(String nome,
                             int tipo,
                             int marca,
                             String string,
                             String versao,
                             BigDecimal valorinicio,
                             BigDecimal valorfim,
                             int faixaano1,
                             int faixaano2,
                             String kminicio,
                             String kmfim)
{
}
