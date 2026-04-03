package com.august.ScraperCar.service;

import com.august.ScraperCar.dto.alerts.request.AlertRequestDTO;
import com.august.ScraperCar.dto.alerts.response.AlertResponseDTO;
import com.august.ScraperCar.dto.alerts.response.UserAlertResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.*;
import com.august.ScraperCar.repository.*;
import com.august.ScraperCar.service.authentication.JwtService;
import com.google.common.hash.Hashing;
import jakarta.transaction.Transactional;
import org.jspecify.annotations.NonNull;
import org.quartz.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.quartz.SchedulerException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
public class AlertsService {

    public final UserRepository userRepository;
    public final SharedJobRepository sharedJobRepository;
    public final UserAlertRepository userAlertRepository;
    public final MarcaRepository marcaRepository;
    public final JwtService jwtService;
    public final Scheduler scheduler;
    public final SentAnnouncementRepository sentRepo;
    private final ValidVeiculoService validVeiculoService;

    private static final BigDecimal VALOR_MAXIMO = new BigDecimal("999999999");
    private static final BigDecimal KM_MAXIMO = new BigDecimal("1000000");


    public AlertsService(UserRepository userRepository,
                         SharedJobRepository sharedJobRepository,
                         UserAlertRepository userAlertRepository,
                         MarcaRepository marcaRepository,
                         JwtService jwtService,
                         Scheduler scheduler,
                         SentAnnouncementRepository sentRepo,
                         ValidVeiculoService validVeiculoService
    ) {
        this.userRepository = userRepository;
        this.sharedJobRepository = sharedJobRepository;
        this.userAlertRepository = userAlertRepository;
        this.marcaRepository = marcaRepository;
        this.jwtService = jwtService;
        this.scheduler = scheduler;
        this.sentRepo = sentRepo;
        this.validVeiculoService = validVeiculoService;
    }


    public ResponseEntity<AlertResponseDTO> criarAlerta(AlertRequestDTO dto, String token) {

        if (dto.getIntervalo() < 30 || dto.getIntervalo() > 1500) {
            throw new BusinessException("Intervalor não permitido", 401);
        }

        if (!(dto.getKminicio() == null)) {
            validarKm(dto.getKminicio(), "KM início");
        }

        validarValor(dto.getValorinicio(), "Valor início");
        validarValor(dto.getValorfim(), "Valor fim");

        validarKm(dto.getKmfim(), "KM fim");


        boolean veiculoValido = validVeiculoService.isValid(
                dto.getMarca(),
                dto.getModelo(),
                dto.getVersao(),
                dto.getFaixaano1(),
                dto.getFaixaano2()
        );


        if (!veiculoValido) {
            throw new BusinessException("Veiculo invalido!", 404);
        }

        String email = jwtService.extrairEmail(token);
        Optional<UserModel> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new BusinessException("Usuário não encontrado!", 404);
        }
        UserModel userID = user.get();

        long veiculokey = hashVeiculo(dto.getMarca(), dto.getModelo(), dto.getVersao(),
                dto.getFaixaano1(), dto.getFaixaano2(),
                dto.getValorinicio(), dto.getValorfim(),
                dto.getKminicio(), dto.getKmfim());

        System.out.println("LOG: PROCURANDO JOB NO BANCO COM O VEICULOKEY");

        String veiculokeyStr = String.valueOf(veiculokey);

        Optional<SharedSearchJobModel> job = sharedJobRepository.findByVeiculoKey(veiculokeyStr);

        if (job.isPresent()) {
            if (userAlertRepository.existsByUser_IdAndJob_VeiculoKey(userID.getId(), job.get().getVeiculoKey())) {
                throw new BusinessException("Você já possui um alerta com este veículo!", 409);
            }

            System.out.println("LOG: Job encontrado no banco!");

            Integer jobIntervalo = job.get().getIntervalo();
            Integer intervaloAlerta = dto.getIntervalo();

            if (intervaloAlerta < jobIntervalo) {
                job.get().setIntervalo(intervaloAlerta);
                sharedJobRepository.save(job.get());
                System.out.println("LOG: Intervalo menor detectado e salvo");

                // Reagenda o trigger no Quartz com o novo intervalo menor
                TriggerKey triggerKey = TriggerKey.triggerKey("trigger-" + job.get().getId(), "scraper");
                Trigger novoTrigger = TriggerBuilder.newTrigger()
                        .withIdentity(triggerKey)
                        .withSchedule(CronScheduleBuilder.cronSchedule(buildCron(intervaloAlerta)))
                        .build();
                try {
                    scheduler.rescheduleJob(triggerKey, novoTrigger);
                    System.out.println("LOG: Trigger reagendado para " + intervaloAlerta + " minutos");
                } catch (SchedulerException e) {
                    throw new BusinessException("Erro ao reagendar job: " + e.getMessage(), 500);
                }
            }

            criarUserAlert(dto, userID, job.get());
            return ResponseEntity.ok(new AlertResponseDTO("Alerta criado! Job já existe", veiculokey));

        } else {
            Optional<MarcasModel> marca = marcaRepository.findById(dto.getMarca());
            if (marca.isEmpty()) {
                throw new BusinessException("Marca não encontrada!", 404);
            }

            SharedSearchJobModel newjob = getJob(dto, veiculokeyStr, marca);
            SharedSearchJobModel savedJob = sharedJobRepository.save(newjob);

            JobDetail jobDetail = JobBuilder.newJob(JobExecutor.class)
                    .withIdentity("job-" + savedJob.getId(), "scraper")
                    .usingJobData("jobId", savedJob.getId())
                    .storeDurably()
                    .build();

            // CronScheduleBuilder: slots fixos no relógio (ex: 12:00, 12:30, 13:00...)
            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity("trigger-" + savedJob.getId(), "scraper")
                    .forJob(jobDetail)
                    .withSchedule(CronScheduleBuilder.cronSchedule(buildCron(savedJob.getIntervalo())))
                    .build();

            try {
                scheduler.scheduleJob(jobDetail, trigger);
            } catch (SchedulerException e) {
                throw new BusinessException("Erro ao agendar job: " + e.getMessage(), 500);
            }

            System.out.println("LOG: Job agendado com ID: " + savedJob.getId());

            criarUserAlert(dto, userID, savedJob);
            return ResponseEntity.ok(new AlertResponseDTO("Alerta e job criado com sucesso!", veiculokey));
        }
    }


    private static @NonNull SharedSearchJobModel getJob(AlertRequestDTO dto, String veiculokey, Optional<MarcasModel> marca)
    {
        if (marca.isEmpty()) {
            throw new BusinessException("Erro de marca", 404);
        }
        SharedSearchJobModel newjob = new SharedSearchJobModel();
        newjob.setVeiculoKey(veiculokey);
        newjob.setModelo(dto.getModelo());
        newjob.setVersao(dto.getVersao());
        newjob.setIntervalo(dto.getIntervalo());
        newjob.setValorfim(dto.getValorfim());
        newjob.setValorinicio(dto.getValorinicio());
        newjob.setAnoMin(dto.getFaixaano1());
        newjob.setAnoMax(dto.getFaixaano2());
        newjob.setKminicio(dto.getKminicio());
        newjob.setKmfim(dto.getKmfim());
        newjob.setAtivo(true);
        newjob.setMarca(marca.get());
        System.out.println("LOG: Job criado");
        return newjob;
    }

    private long hashVeiculo(int marca, String modelo, String versao, int faixaano1, int faixaano2, BigDecimal precomin, BigDecimal precomax, String kminicio, String kmmax) {
        String input = marca + "|" + modelo + "|" + versao + "|" + faixaano1 + "|" + faixaano2 + "|" + precomin + "|" + precomax + "|" + kminicio + "|" + kmmax;
        return Hashing.murmur3_32_fixed()
                .hashString(input, StandardCharsets.UTF_8).asInt();
    }

    public void criarUserAlert(AlertRequestDTO dto, UserModel user, SharedSearchJobModel job) {
        UserAlerts alerta = new UserAlerts();
        alerta.setIntervaloAlerta(dto.getIntervalo());
        alerta.setUser(user);
        alerta.setJob(job);
        alerta.setAtivo(true);
        userAlertRepository.save(alerta);
        System.out.println("LOG: UserAlert criado!");

        try {
            scheduler.triggerJob(JobKey.jobKey("job-" + job.getId(), "scraper"));
            System.out.println("Job disparado imediatamente para jobId: " + job.getId());
        } catch (SchedulerException e) {
            throw new BusinessException("Erro ao disparar job: " + e.getMessage(), 500);
        }
        System.out.println("✅ Job agendado para execução imediata");
    }

    private String buildCron(int intervaloMinutos) {
        if (intervaloMinutos >= 60) {
            int horas = intervaloMinutos / 60;
            return "0 0 0/" + horas + " * * ?";
        }
        return "0 0/" + intervaloMinutos + " * * * ?";
    }

    @Transactional
    public ResponseEntity<String> excluirAlerta(Long userAlertId, String token) {
        String email = jwtService.extrairEmail(token);
        Optional<UserModel> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new BusinessException("Usuário não encontrado", 401);
        }

        UserAlerts alerta = userAlertRepository.findById(userAlertId)
                .orElseThrow(() -> new BusinessException("Alerta não encontrado!", 404));

        if (!alerta.getUser().getId().equals(user.get().getId())) {
            throw new BusinessException("Sem permissã para excluir este alerta!", 403);
        }

        SharedSearchJobModel job = alerta.getJob();

        sentRepo.deleteByUserAlertsId(alerta.getId());
        System.out.println("LOG: SentAnnouncements excluídos");

        userAlertRepository.delete(alerta);
        System.out.println("User Alert excluido com sucesso!");

        boolean jobSemUsuarios = userAlertRepository.findByJob_veiculoKey(job.getVeiculoKey()).isEmpty();

        if (jobSemUsuarios) {
            TriggerKey triggerKey = TriggerKey.triggerKey("trigger-" + job.getId(), "scraper");
            JobKey jobKey = JobKey.jobKey("job-" + job.getId(), "scraper");

            try {
                scheduler.unscheduleJob(triggerKey);
                scheduler.deleteJob(jobKey);
                System.out.println("LOG: Job removido do Quartz");
            } catch (SchedulerException e) {
                throw new BusinessException("Erro ao remover job do Quartz: " + e.getMessage(), 500);
            }

            sharedJobRepository.delete(job);
            System.out.println("LOG: Job removido do banco");
        }

        return ResponseEntity.ok("Alerta excluido com sucesso!");
    }

    public ResponseEntity<String> toggleUserAlert(Long userAlertId, String token) {
        String email = jwtService.extrairEmail(token);
        Optional<UserModel> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new BusinessException("Usuario nao encontrado!", 404);
        }

        UserAlerts alerta = userAlertRepository.findById(userAlertId)
                .orElseThrow(() -> new BusinessException("Alerta não encontrado!", 404));

        if (!alerta.getUser().getId().equals(user.get().getId())) {
            throw new BusinessException("Sem permissão para alterar este alerta!", 403);
        }

        alerta.setAtivo(!alerta.getAtivo());
        userAlertRepository.save(alerta);

        String veiculokey = alerta.getJob().getVeiculoKey();
        JobKey jobKey = JobKey.jobKey("job-" + alerta.getJob().getId(), "scraper");

        try {
            boolean algumAtivoExiste = userAlertRepository.existsByJob_VeiculoKeyAndAtivoTrue(veiculokey);

            if (!algumAtivoExiste) {
                scheduler.pauseJob(jobKey);
                System.out.println("LOG: Job pausado pois todos os alertas estão inativos");
            } else {
                scheduler.resumeJob(jobKey);
                System.out.println("LOG: Job retomado pois há alertas ativos");
            }
        } catch (SchedulerException e) {
            throw new BusinessException("Erro ao pausar/retomar job: " + e.getMessage(), 500);
        }

        String status = alerta.getAtivo() ? "ativado" : "pausado";
        return ResponseEntity.ok("Alerta " + status + " com sucesso!");
    }

    @Transactional
    public List<UserAlertResponseDTO> listarAlertas(String token) {
        String email = jwtService.extrairEmail(token);
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado!", 404));

        return userAlertRepository.findByUser_Id(user.getId())
                .stream()
                .map(alerta -> new UserAlertResponseDTO(
                        alerta.getId(),
                        alerta.getJob().getModelo(),
                        alerta.getJob().getVersao(),
                        alerta.getJob().getMarca().getNome(),
                        alerta.getJob().getValorinicio(),
                        alerta.getJob().getValorfim(),
                        alerta.getJob().getAnoMin(),
                        alerta.getJob().getAnoMax(),
                        alerta.getJob().getKminicio(),
                        alerta.getJob().getKmfim(),
                        alerta.getIntervaloAlerta(),
                        alerta.getAtivo(),
                        alerta.getCreatedAt()
                ))
                .toList();
    }

    private void validarValor(BigDecimal valor, String campo) {
        if (valor == null) {
            return;
        }
        if (valor.compareTo(VALOR_MAXIMO) >= 0) {
            throw new IllegalArgumentException(campo + " não pode ser maior que 999.999.999");
        }
    }

    private void validarKm(String kmStr, String campo) {
        if (!kmStr.matches("\\d+(\\.\\d+)?")) {
            throw new IllegalArgumentException(campo + " deve conter apenas números");
        }
        if (new BigDecimal(kmStr).compareTo(KM_MAXIMO) >= 0) {
            throw new IllegalArgumentException(campo + " não pode ser maior ou igual a 1.000.000");
        }
    }
}
