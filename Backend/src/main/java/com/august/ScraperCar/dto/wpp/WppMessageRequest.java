package com.august.ScraperCar.dto.wpp;

public record WppMessageRequest(String phone,
                                boolean isGroup,
                                boolean isNewsletter,
                                boolean isLid,
                                String message) {

}

