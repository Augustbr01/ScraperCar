package com.august.ScraperCar.service;

import com.august.ScraperCar.dto.alerts.request.AlertRequestDTO;
import com.august.ScraperCar.dto.alerts.response.AlertResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.MarcasModel;
import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.model.UserAlerts;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.MarcaRepository;
import com.august.ScraperCar.repository.SharedJobRepository;
import com.august.ScraperCar.repository.UserAlertRepository;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.service.authentication.JwtService;
import com.google.common.hash.Hashing;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class AlertsService {

    public final UserRepository userRepository;
    public final SharedJobRepository sharedJobRepository;
    public final UserAlertRepository userAlertRepository;
    public final MarcaRepository marcaRepository;
    public final JwtService jwtService;

    public AlertsService(UserRepository userRepository,
                         SharedJobRepository sharedJobRepository,
                         UserAlertRepository userAlertRepository,
                         MarcaRepository marcaRepository, JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.sharedJobRepository = sharedJobRepository;
        this.userAlertRepository = userAlertRepository;
        this.marcaRepository = marcaRepository;
        this.jwtService = jwtService;
    }

    public ResponseEntity<AlertResponseDTO> criaralerta(AlertRequestDTO dto, String token) {

        String email = jwtService.extrairEmail(token);
        Optional<UserModel> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserModel userID = user.get();


        long jobkey = hashJob(dto.getMarca(), dto.getModelo(), dto.getVersao(), dto.getFaixaano1(), dto.getFaixaano2(), dto.getKminicio(), dto.getKmfinal(), dto.getIntervaloms());
        long veiculokey = hashVeiculo(dto.getMarca(), dto.getModelo(), dto.getVersao(), dto.getFaixaano1(), dto.getFaixaano2(), dto.getKminicio(), dto.getKmfinal());

        Optional<SharedSearchJobModel> job = sharedJobRepository.findSharedSearchJobModelByJobKey(jobkey);

        // Verifica se existe um job igual no banco
        if (job.isPresent()) {
            System.out.println("Job encontrado no banco!");
            criarUserAlert(userID, job.get());

            return ResponseEntity.ok(new AlertResponseDTO("Ja existente no banco", jobkey, veiculokey));
        }

        // Verifica se existe a marca no banco


        Optional<MarcasModel> marca = marcaRepository.findById(dto.getMarca());
        if (marca.isEmpty()) {
            System.out.println("marca nao encontrada!");
            return ResponseEntity.notFound().build();
        }

        // Cria o job no banco de dados
        SharedSearchJobModel newjob = new SharedSearchJobModel();
        newjob.setJobKey(jobkey);
        newjob.setVeiculo_key(veiculokey);
        newjob.setModelo(dto.getModelo());
        newjob.setVersao(dto.getVersao());
        newjob.setIntervalo(dto.getIntervaloms());
        newjob.setPrecoMax(dto.getPrecoMax());
        newjob.setPrecoMin(dto.getPrecoMin());
        newjob.setAno_max(dto.getFaixaano2());
        newjob.setAno_min(dto.getFaixaano1());
        newjob.setKminicio(dto.getKminicio());
        newjob.setKmfinal(dto.getKmfinal());
        newjob.setAtivo(true);

        newjob.setMarca(marca.get());
        SharedSearchJobModel savedJob = sharedJobRepository.save(newjob);
        System.out.println("Job criado");

        criarUserAlert(userID, savedJob);
        System.out.println("UserAlert criado!");

        return ResponseEntity.ok(new AlertResponseDTO("Criado com sucesso", jobkey, veiculokey));
    }

    private long hashJob(int marca, String modelo, String versao, int faixaano1, int faixaano2, String kminicio, String kmmax, double intervaloms) {
        String input = marca + "|" + modelo + "|" + versao + "|" + faixaano1 + "|" + faixaano2 + "|" + kminicio + "|" + kmmax + "|" + intervaloms;
        return Hashing.murmur3_32_fixed()
                .hashString(input, StandardCharsets.UTF_8).asInt();
    }

    private long hashVeiculo(int marca, String modelo, String versao, int faixaano1, int faixaano2, String kminicio, String kmmax) {
        String input = marca + "|" + modelo + "|" + versao + "|" + faixaano1 + "|" + faixaano2 + "|" + kminicio + "|" + kmmax;
        return Hashing.murmur3_32_fixed()
                .hashString(input, StandardCharsets.UTF_8).asInt();
    }

    public void criarUserAlert(UserModel user, SharedSearchJobModel job) {
        if (userAlertRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new BusinessException("Ja existente no banco", 401);
        }
        UserAlerts alerta = new UserAlerts();
        alerta.setUser(user);
        alerta.setJob(job);
        alerta.setAtivo(true);
        userAlertRepository.save(alerta);
    }
}
