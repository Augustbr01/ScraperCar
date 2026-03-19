package com.august.ScraperCar.dto.admin;

import java.time.LocalDateTime;

public record AdminAlertDTO(
        Long id,
        String userEmail,
        String veiculoKey,
        Integer intervaloAlerta,
        Boolean ativo,
        LocalDateTime createdAt
) {}