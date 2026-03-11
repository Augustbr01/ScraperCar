package com.august.ScraperCar.controller;

import com.august.ScraperCar.dto.alerts.request.AlertRequestDTO;
import com.august.ScraperCar.dto.alerts.response.AlertResponseDTO;
import com.august.ScraperCar.service.AlertsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    public final AlertsService alertsService;

    public AlertController(AlertsService alertsService) {
        this.alertsService = alertsService;
    }

    @PostMapping("/create")
    public ResponseEntity<AlertResponseDTO> criaralerta(@RequestBody AlertRequestDTO dto, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return alertsService.criaralerta(dto, token);
    }

    //@PostMapping("/create")
    //public String criaralerta() {
    //    return "teste";
    //}
}
