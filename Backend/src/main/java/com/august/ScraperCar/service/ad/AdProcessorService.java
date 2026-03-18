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
        if (!result.isFreshScrape()) return;

        List<UserAlerts> alertas = userAlertRepository.findByJob_veiculoKey(job.getVeiculoKey());

        for  (UserAlerts alerta : alertas) {
            for (AnuncioDTO anuncio : result.anuncios()) {
                processarAnuncio(alerta, anuncio);
            }
        }
    }

    private void processarAnuncio(UserAlerts alerta, AnuncioDTO anuncio) {
        Optional<SentAnnouncementModel> sent = sentAnnouncementRepository.findByUserAlertsAndAnuncioId(alerta, anuncio.getId());

        if (sent.isEmpty()) {
            whatsAppService.enviarAlerta(alerta.getUser(), anuncio);
            salvarSent(alerta, anuncio);
        } else if (precoMudou(sent.get().getUltimoPreco(), anuncio)) {
            whatsAppService.enviarAlertaPreco(alerta.getUser(), anuncio, sent.get().getUltimoPreco());
            alterarSentPreco(sent.get(), anuncio);
        }
    }

    private void salvarSent(UserAlerts alerta, AnuncioDTO anuncio) {
        SentAnnouncementModel sent = new SentAnnouncementModel();
        sent.setUserAlerts(alerta);
        sent.setAnuncioId(anuncio.getId());
        sent.setUltimoPreco(anuncio.getPreco());
        sentAnnouncementRepository.save(sent);
    }

    private void alterarSentPreco(SentAnnouncementModel sent, AnuncioDTO anuncio) {
        sent.setUltimoPreco(anuncio.getPreco());
        sent.setPrecoAtualizadoEm(LocalDateTime.now());
        sentAnnouncementRepository.save(sent);
    }

    private boolean precoMudou(BigDecimal preco, AnuncioDTO anuncio) {
        if (preco == null || anuncio.getPreco() == null) return false;
        return preco.compareTo(anuncio.getPreco()) != 0;
    }
}
