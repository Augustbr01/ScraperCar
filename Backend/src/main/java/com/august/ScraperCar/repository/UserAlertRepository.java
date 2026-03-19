package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.UserAlerts;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserAlertRepository extends JpaRepository<UserAlerts, Long> {
    boolean existsByUser_IdAndJob_VeiculoKey(UUID userId, String veiculoKey);
    List<UserAlerts> findByJob_veiculoKey(String veiculoKey);
    List<UserAlerts> findByUser_Id(UUID userId);
    boolean existsByJob_VeiculoKeyAndAtivoTrue(String veiculoKey);
}


