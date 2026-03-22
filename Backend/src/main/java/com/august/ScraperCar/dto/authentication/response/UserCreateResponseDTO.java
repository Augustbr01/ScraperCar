package com.august.ScraperCar.dto.authentication.response;

import java.util.UUID;

public record UserCreateResponseDTO(
        UUID id,
        String nome,
        String email,
        String telefone,
        String codigoVerificacao,
        String numeroBo
) {}