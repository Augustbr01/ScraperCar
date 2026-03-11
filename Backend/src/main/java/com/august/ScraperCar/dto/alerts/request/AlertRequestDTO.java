package com.august.ScraperCar.dto.alerts.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AlertRequestDTO {
    private Integer marca;
    private String modelo;
    private String versao;
    private int faixaano1;
    private int faixaano2;
    private BigDecimal precoMax;
    private BigDecimal precoMin;
    private String kminicio;
    private String kmfinal;
    private long intervaloms;
}
