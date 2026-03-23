package com.august.ScraperCar.controller;

import com.august.ScraperCar.service.wpp.VerifyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/verify")
public class verifyController {

    private final VerifyService verifyService;

    public verifyController(VerifyService verifyService) {
        this.verifyService = verifyService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> status(@RequestParam("phone") String telefone) {
        Boolean verificado = verifyService.verificarTelefone(telefone);
        return ResponseEntity.ok(Map.of("verificado", verificado));
    }
}
