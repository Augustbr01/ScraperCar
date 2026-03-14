package com.august.ScraperCar.service;

import com.august.ScraperCar.dto.scraper.AnuncioDTO;
import com.august.ScraperCar.dto.wpp.WppMessageRequest;
import com.august.ScraperCar.model.UserModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;


@Service
public class WhatsAppService {
    private final WebClient wppClient;

    public WhatsAppService(@Qualifier("wppClient") WebClient wppClient) {
        this.wppClient = wppClient;
    }

    @Value("${wpp.session}")
    private String session;

    @Value("${wpp.token}")
    private String token;

    public void enviarAlerta(UserModel user, List<AnuncioDTO> anuncios) {
        String mensagem = formatarMensagem(anuncios);

        WppMessageRequest body = new WppMessageRequest(
                user.getTelefone(),
                false, false, false,
                mensagem
        );

        wppClient.post()
                .uri("/api/" + session + "/send-message")
                .header("Authorization", "Bearer " + token)
                .body(Mono.just(body), WppMessageRequest.class)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    private String formatarMensagem(List<AnuncioDTO> anuncios) {
        StringBuilder mensagem = new StringBuilder();
        mensagem.append("🚗 *Novos anúncios encontrados!*\n\n");

        for (AnuncioDTO a : anuncios) {
            mensagem.append("*").append(a.getModelo()).append("*\n");
            mensagem.append("💰 ").append(a.getPreco()).append("\n");
            mensagem.append("📅 ").append(a.getAno())
                    .append(" | 🛣️ ").append(a.getKm()).append("\n");
            mensagem.append("📍 ").append(a.getCidade()).append("\n");
            mensagem.append("🔗 ").append(a.getLink()).append("\n\n");
        }

        return mensagem.toString();
    }
}
