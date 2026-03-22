package com.august.ScraperCar.controller;

import com.august.ScraperCar.dto.wpp.WppWebHookDTO;
import com.august.ScraperCar.service.scraper.wpp.VerifyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class webhookController {

    private final VerifyService verifyService;

    public webhookController(VerifyService verifyService) {
        this.verifyService = verifyService;
    }

    @PostMapping("/wpp")
    public ResponseEntity<Void> receberMensagem(@RequestBody WppWebHookDTO dto) {
        if ("onmessage".equals(dto.event())
                && "chat".equals(dto.type())
                && Boolean.FALSE.equals(dto.isGroupMsg())
                && Boolean.FALSE.equals(dto.fromMe())) {
            System.out.println("Mensagem de: " + dto.from() + " | Conteúdo: " + dto.body());
            verifyService.processar(dto.from(), dto.body());
        }
        return ResponseEntity.ok().build();
    }
}
