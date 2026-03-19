package com.august.ScraperCar.dto.admin;

import java.time.LocalDateTime;

public record AdminJobDTO(
        Long id,
        String veiculoKey,
        String nomeMarca,
        String modelo,
        String versao,
        Integer intervalo,
        boolean ativo,
        LocalDateTime lastRunAt
) {}