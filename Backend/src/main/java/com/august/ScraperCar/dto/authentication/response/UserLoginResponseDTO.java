package com.august.ScraperCar.dto.authentication.response;

public record UserLoginResponseDTO(String accessToken, String refreshToken, String email) {}