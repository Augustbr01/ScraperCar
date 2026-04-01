package com.august.ScraperCar.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RefreshCookieUtil {
    @Value("${app.production}")
    private boolean production;

    public ResponseCookie criar(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(production)
                .path("/auth/refresh")
                .maxAge(Duration.ofDays(30))
                .sameSite("None")
                .build();
    }

    public ResponseCookie apagar() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(production)
                .path("/auth/refresh")
                .maxAge(0)
                .sameSite("None")
                .build();
    }
}
