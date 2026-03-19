package com.august.ScraperCar.service.ad;

import com.august.ScraperCar.dto.scraper.AnuncioDTO;
import com.august.ScraperCar.dto.scraper.ScraperResult;
import com.august.ScraperCar.model.SentAnnouncementModel;
import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.model.UserAlerts;
import com.august.ScraperCar.repository.SentAnnouncementRepository;
import com.august.ScraperCar.repository.UserAlertRepository;
import com.august.ScraperCar.service.WhatsAppService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdProcessorService {

    private final SentAnnouncementRepository sentAnnouncementRepository;
    private final WhatsAppService whatsAppService;
    private final UserAlertRepository userAlertRepository;

    public AdProcessorService(SentAnnouncementRepository sentAnnouncementRepository,
                              WhatsAppService whatsAppService,
                              UserAlertRepository userAlertRepository) {
        this.sentAnnouncementRepository = sentAnnouncementRepository;
        this.whatsAppService = whatsAppService;
        this.userAlertRepository = userAlertRepository;
    }

    public void processar(SharedSearchJobModel job, ScraperResult result) {
        System.out.println("Processar iniciou!");

        List<UserAlerts> alertas = userAlertRepository.findByJob_veiculoKey(job.getVeiculoKey());

        for  (UserAlerts alerta : alertas) {
            for (AnuncioDTO anuncio : result.anuncios()) {
                processarAnuncio(alerta, anuncio);
            }
        }
        System.out.println("Processar fim!");
    }

    private void processarAnuncio(UserAlerts alerta, AnuncioDTO anuncio) {
        System.out.println("Processar anuncio inicio");
        Optional<SentAnnouncementModel> sent = sentAnnouncementRepository.findByUserAlertsAndAnuncioId(alerta, anuncio.getId());

        if (sent.isPresent() && !deveNotificar(sent.get(), alerta.getIntervaloAlerta())) {  // Assuma campo userAlert.intervaloMinutos
            System.out.println("Pular notificação: tempo insuficiente");
            return;
        }

        if (sent.isEmpty()) {
            whatsAppService.enviarAlerta(alerta.getUser(), anuncio);
            salvarSent(alerta, anuncio);
            atualizarLastNotified(alerta);
        } else if (precoMudou(sent.get().getUltimoPreco(), anuncio)) {
            whatsAppService.enviarAlertaPreco(alerta.getUser(), anuncio, sent.get().getUltimoPreco());

            alterarSentPreco(sent.get(), anuncio);
            atualizarLastNotified(alerta);
        }
        System.out.println("Processar anuncio fim");
    }

    private boolean deveNotificar(SentAnnouncementModel sent, int intervaloMinutos) {
        if (sent.getSentAt() == null) return true;

        // Slot global: múltiplo fixo desde meia-noite (13:00, 13:30, 14:00...)
        LocalDateTime agora = LocalDateTime.now();
        long minutosHoje = agora.getHour() * 60L + agora.getMinute();
        long slotAtualMinutos = (minutosHoje / intervaloMinutos) * intervaloMinutos;
        LocalDateTime slotAtual = agora.withHour(0).withMinute(0).withSecond(0)
                .plusMinutes(slotAtualMinutos);

        // Deve notificar se última foi antes deste slot
        return sent.getSentAt().isBefore(slotAtual);
    }


    private void salvarSent(UserAlerts alerta, AnuncioDTO anuncio) {
        SentAnnouncementModel sent = new SentAnnouncementModel();
        sent.setUserAlerts(alerta);
        sent.setAnuncioId(anuncio.getId());
        sent.setUltimoPreco(anuncio.getPreco());
        sent.setSentAt(LocalDateTime.now());  // NOVO
        sentAnnouncementRepository.save(sent);
    }

    private void alterarSentPreco(SentAnnouncementModel sent, AnuncioDTO anuncio) {
        sent.setUltimoPreco(anuncio.getPreco());
        sent.setPrecoAtualizadoEm(LocalDateTime.now());
        sent.setSentAt(LocalDateTime.now());  // NOVO
        sentAnnouncementRepository.save(sent);
    }

    private boolean precoMudou(BigDecimal preco, AnuncioDTO anuncio) {
        if (preco == null || anuncio.getPreco() == null) return false;
        return preco.compareTo(anuncio.getPreco()) != 0;
    }

    private void atualizarLastNotified(UserAlerts alerta) {
        alerta.setLastNotifiedAt(LocalDateTime.now());
        userAlertRepository.save(alerta);
    }
}
