package com.august.ScraperCar.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PepperUtil {

    @Value("${security.pepper}")
    private String pepper;

    public String aplicar(String senha) {
        return senha + pepper;
    }
}