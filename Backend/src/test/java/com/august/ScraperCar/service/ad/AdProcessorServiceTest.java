package com.august.ScraperCar.service.ad;

import com.august.ScraperCar.dto.scraper.AnuncioDTO;
import com.august.ScraperCar.dto.scraper.ScraperResult;
import com.august.ScraperCar.model.SentAnnouncementModel;
import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.model.UserAlerts;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.SentAnnouncementRepository;
import com.august.ScraperCar.repository.UserAlertRepository;
import com.august.ScraperCar.service.WhatsAppService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdProcessorServiceTest {

    @Mock
    SentAnnouncementRepository sentRepo;
    @Mock
    WhatsAppService whatsAppService;
    @Mock
    UserAlertRepository userAlertRepository;

    @InjectMocks
    AdProcessorService adProcessorService;

    @Test
    void deveEnviarAlertaQuandoAnuncioNovo() {
        SharedSearchJobModel job = new SharedSearchJobModel();
        job.setVeiculoKey("hb20-key");

        AnuncioDTO anuncio = new AnuncioDTO();
        anuncio.setId("123");
        anuncio.setPreco(new BigDecimal("35000"));

        UserAlerts alerta = new UserAlerts();
        alerta.setUser(new UserModel());

        ScraperResult result = new ScraperResult(List.of(anuncio), true);

        when(userAlertRepository.findByJob_veiculoKey("hb20-key"))
                .thenReturn(List.of(alerta));
        when(sentRepo.findByUserAlertsAndAnuncioId(alerta, "123"))
                .thenReturn(Optional.empty());

        adProcessorService.processar(job, result);

        verify(whatsAppService).enviarAlerta(any(), eq(anuncio));
        verify(sentRepo).save(any(SentAnnouncementModel.class));
    }

    @Test
    void deveEnviarAlertaPrecoQuandoPrecoMudou() {
        // ✅ job e result declarados aqui
        SharedSearchJobModel job = new SharedSearchJobModel();
        job.setVeiculoKey("hb20-key");

        AnuncioDTO anuncio = new AnuncioDTO();
        anuncio.setId("123");
        anuncio.setPreco(new BigDecimal("35000"));

        UserAlerts alerta = new UserAlerts();
        alerta.setUser(new UserModel());

        SentAnnouncementModel sent = new SentAnnouncementModel();
        sent.setUltimoPreco(new BigDecimal("38000"));

        ScraperResult result = new ScraperResult(List.of(anuncio), true);

        // ✅ userAlertRepository mockado
        when(userAlertRepository.findByJob_veiculoKey("hb20-key"))
                .thenReturn(List.of(alerta));
        when(sentRepo.findByUserAlertsAndAnuncioId(alerta, "123"))
                .thenReturn(Optional.of(sent));

        adProcessorService.processar(job, result);

        verify(whatsAppService).enviarAlertaPreco(
                any(), eq(anuncio), eq(new BigDecimal("38000")));
    }

    @Test
    void naoDeveProcessarSeCacheNaoForFresco() {
        ScraperResult result = new ScraperResult(List.of(), false);

        adProcessorService.processar(new SharedSearchJobModel(), result);

        verifyNoInteractions(whatsAppService, sentRepo);
    }
}
