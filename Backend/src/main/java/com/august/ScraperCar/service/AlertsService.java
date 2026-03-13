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
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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


    public ResponseEntity<AlertResponseDTO> criarAlerta(AlertRequestDTO dto, String token) {

        String email = jwtService.extrairEmail(token);
        Optional<UserModel> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new BusinessException("Usuário não encontrado!", 404);
        }
        UserModel userID = user.get();

        long veiculokey = hashVeiculo(dto.getMarca(), dto.getModelo(), dto.getVersao(),
                dto.getFaixaano1(), dto.getFaixaano2(),
                dto.getPrecoMin(), dto.getPrecoMax(),
                dto.getKminicio(), dto.getKmfinal());

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

            criarUserAlert(dto, userID, savedJob);
            return ResponseEntity.ok(new AlertResponseDTO("Alerta e job criado com sucesso!", veiculokey));
        }
    }


    private static @NonNull SharedSearchJobModel getJob(AlertRequestDTO dto, String veiculokey, Optional<MarcasModel> marca) {

        SharedSearchJobModel newjob = new SharedSearchJobModel();
        newjob.setVeiculoKey(veiculokey);
        newjob.setModelo(dto.getModelo());
        newjob.setVersao(dto.getVersao());
        newjob.setIntervalo(dto.getIntervalo());
        newjob.setPrecoMax(dto.getPrecoMax());
        newjob.setPrecoMin(dto.getPrecoMin());
        newjob.setAnoMin(dto.getFaixaano1());
        newjob.setAnoMax(dto.getFaixaano2());
        newjob.setKmInicio(dto.getKminicio());
        newjob.setKmFinal(dto.getKmfinal());
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
    }
}
