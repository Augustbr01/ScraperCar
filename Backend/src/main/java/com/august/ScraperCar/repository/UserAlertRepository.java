package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.UserAlerts;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAlertRepository extends JpaRepository<UserAlerts, Long> {
    boolean existsByUserIdAndJobId(UUID userID, Long jobID);

    List<UserAlerts> findByUserId(UUID userId);
    long countByUserId(UUID userId);
}


