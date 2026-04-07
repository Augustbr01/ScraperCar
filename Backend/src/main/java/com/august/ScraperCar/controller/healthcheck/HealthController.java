package com.august.ScraperCar.controller.healthcheck;

import com.august.ScraperCar.service.health.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {
    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/api")
    public ResponseEntity<Boolean> check() {
        return ResponseEntity.ok(true);
    }

    @GetMapping("/worker")
    public ResponseEntity<Boolean> checkWorker() {
        return ResponseEntity.ok(healthService.checkWorker());
    }

    @GetMapping("/wpp")
    public ResponseEntity<Boolean> checkWpp() {
        return ResponseEntity.ok(healthService.checkWPP());
    }
}
