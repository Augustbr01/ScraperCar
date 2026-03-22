package com.august.ScraperCar.dto.wpp;

public record ContactDTO(PhoneNumberDTO phoneNumber) {
    public record PhoneNumberDTO(
            String id, String server, String _serialized
    ) {}
}
