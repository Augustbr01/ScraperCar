package com.august.ScraperCar.service.admin;

import com.august.ScraperCar.dto.admin.AdminAlertDTO;
import com.august.ScraperCar.dto.admin.AdminJobDTO;
import com.august.ScraperCar.dto.admin.AdminUserDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.*;
import com.august.ScraperCar.repository.*;
import jakarta.transaction.Transactional;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerKey;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final UserAlertRepository userAlertRepository;
    private final SharedJobRepository sharedJobRepository;
    private final SentAnnouncementRepository sentRepo;
    public final Scheduler scheduler;

    public AdminService(UserRepository userRepository,
                        UserAlertRepository userAlertRepository,
                        SharedJobRepository sharedJobRepository,
                        SentAnnouncementRepository sentRepo,
                        Scheduler scheduler) {
        this.userRepository = userRepository;
        this.userAlertRepository = userAlertRepository;
        this.sharedJobRepository = sharedJobRepository;
        this.sentRepo = sentRepo;
        this.scheduler = scheduler;
    }

    @Transactional
    public ResponseEntity<String> excluirUserAlert(Long userAlertId) {

        UserAlerts alerta = userAlertRepository.findById(userAlertId)
                .orElseThrow(() -> new BusinessException("Alerta não encontrado!", 404));

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

    @Transactional
    public List<AdminUserDTO> listarUsuarios() {
        return userRepository.findAll()
                .stream()
                .map(u -> new AdminUserDTO(
                        u.getId(), u.getNome(), u.getEmail(),
                        u.getTelefone(), u.getRole(), u.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public List<AdminJobDTO> listarJobs() {
        return sharedJobRepository.findAll()
                .stream()
                .map(j -> new AdminJobDTO(
                        j.getId(), j.getVeiculoKey(),
                        j.getMarca().getNome(), j.getModelo(),
                        j.getVersao(), j.getIntervalo(),
                        j.isAtivo(), j.getLastRunAt()
                ))
                .toList();
    }

    @Transactional
    public List<AdminAlertDTO> listarAlertasAll() {
        return userAlertRepository.findAll()
                .stream()
                .map(a -> new AdminAlertDTO(
                        a.getId(), a.getUser().getEmail(),
                        a.getJob().getVeiculoKey(), a.getIntervaloAlerta(),
                        a.getAtivo(), a.getCreatedAt()
                ))
                .toList();
    }
}
