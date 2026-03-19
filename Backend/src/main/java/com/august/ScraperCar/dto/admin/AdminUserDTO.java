package com.august.ScraperCar.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserDTO(
        UUID id,
        String nome,
        String email,
        String telefone,
        String role,
        LocalDateTime createdAt
) {}