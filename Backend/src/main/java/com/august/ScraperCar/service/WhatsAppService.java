package com.august.ScraperCar.service;

import com.august.ScraperCar.dto.scraper.AnuncioDTO;
import com.august.ScraperCar.dto.wpp.WppMessageRequest;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.service.authentication.JwtService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Optional;


@Service
public class WhatsAppService {
    private final WebClient wppClient;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public WhatsAppService(@Qualifier("wppClient") WebClient wppClient,
                           @Qualifier("jwtService") JwtService jwtService,
                           UserRepository userRepository) {
        this.wppClient = wppClient;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Value("${wpp.session}")
    private String session;

    @Value("${wpp.token}")
    private String tokenWPP;

    public void enviarAlerta(UserModel user, AnuncioDTO anuncio) {
        System.out.println("Enviar alerta entrou!");
        String mensagem = formatarMensagem(anuncio, "alertaNovo", null);

        WppMessageRequest body = new WppMessageRequest(
                user.getTelefone(),
                false, false, false,
                mensagem
        );

        post(body);
    }

    public void enviarAlertaPreco(UserModel user, AnuncioDTO anuncio, BigDecimal precoantigo) {
        String mensagem = formatarMensagem(anuncio, "alteracaoPreco", precoantigo);

        WppMessageRequest body = new WppMessageRequest(
                user.getTelefone(),
                false, false, false,
                mensagem
        );

        post(body);
    }

    private String formatarMensagem(AnuncioDTO a, String tipo, BigDecimal precoAntigo) {
        System.out.println("formatar mensagem entrou!");
        if (tipo.equals("alertaNovo")) {
            return "🚗 *Novo anúncio encontrado!*\n\n" +
                    "*" + a.getModelo() + "*\n" +
                    "💰 " + formatarPreco(a.getPreco()) + "\n" +
                    "📅 " + a.getAno() + " | 🛣️ " + a.getKm() + " km\n" +
                    "📍 " + a.getCidade() + "\n" +
                    "🔗 " + a.getLink();

        } else if (tipo.equals("alteracaoPreco")) {
            boolean caiu = a.getPreco().compareTo(precoAntigo) < 0;
            String seta = caiu ? "📉" : "📈";
            String variacao = calcularVariacao(precoAntigo, a.getPreco());

            return seta + " *Alerta de preço!*\n\n" +
                    "*" + a.getModelo() + "*\n" +
                    "De: ~~" + formatarPreco(precoAntigo) + "~~\n" +   // riscado no WhatsApp
                    "Para: *" + formatarPreco(a.getPreco()) + "*\n" +
                    "Variação: " + variacao + "\n\n" +
                    "📅 " + a.getAno() + " | 🛣️ " + a.getKm() + " km\n" +
                    "📍 " + a.getCidade() + "\n" +
                    "🔗 " + a.getLink();
        }
        return "";
    }

    private String formatarPreco(BigDecimal preco) {
        return NumberFormat.getCurrencyInstance(Locale.of("pt", "BR")).format(preco);
    }

    private String calcularVariacao(BigDecimal antigo, BigDecimal novo) {
        BigDecimal diff = novo.subtract(antigo);
        BigDecimal percent = diff.divide(antigo, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
        String sinal = diff.compareTo(BigDecimal.ZERO) < 0 ? "" : "+";
        return sinal + percent + "% (R$ " + formatarPreco(diff.abs()) + ")";
    }

    public void enviarMensagemTeste(String token, String mensagem) {
        String tokencapturado = token.substring(7);
        String email = jwtService.extrairEmail(tokencapturado);
        Optional<UserModel> userExist = userRepository.findByEmail(email);
        if (userExist.isEmpty()) {
            throw new BusinessException("Usuario nao existe", 401);
        }

        WppMessageRequest body = new WppMessageRequest(
                userExist.get().getTelefone(),
                false, false, false,
                mensagem
        );

        post(body);
    }

    private void post(WppMessageRequest body) {
        System.out.println("Post entrou!");
        wppClient.post()
                .uri("/api/" + session + "/send-message")
                .header("Authorization", "Bearer " + tokenWPP)
                .body(Mono.just(body), WppMessageRequest.class)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        System.out.println("post saiu!");
    }

}
