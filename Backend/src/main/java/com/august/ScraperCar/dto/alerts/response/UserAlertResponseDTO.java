package com.august.ScraperCar.dto.alerts.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserAlertResponseDTO(
        Long id,
        String modelo,
        String versao,
        String nomeMarca,
        BigDecimal valorinicio,
        BigDecimal valorfim,
        Integer anoMin,
        Integer anoMax,
        String kminicio,
        String kmfim,
        Integer intervaloAlerta,
        Boolean ativo,
        LocalDateTime createdAt
) {}