package com.august.ScraperCar.controller;

import com.august.ScraperCar.dto.alerts.request.AlertRequestDTO;
import com.august.ScraperCar.dto.alerts.response.AlertResponseDTO;
import com.august.ScraperCar.dto.alerts.response.UserAlertResponseDTO;
import com.august.ScraperCar.service.AlertsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return alertsService.criarAlerta(dto, token);
    }

    @DeleteMapping("/{userAlertId}")
    public ResponseEntity<String> excluirAlerta(@PathVariable Long userAlertId, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return alertsService.excluirAlerta(userAlertId, token);
    }

    @PatchMapping("/toggle/{userAlertId}")
    public ResponseEntity<String> toggleAlerta(@PathVariable Long userAlertId, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return alertsService.toggleUserAlert(userAlertId, token);
    }

    @GetMapping
    public List<UserAlertResponseDTO> listarAlerta(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return alertsService.listarAlertas(token);
    }
}
