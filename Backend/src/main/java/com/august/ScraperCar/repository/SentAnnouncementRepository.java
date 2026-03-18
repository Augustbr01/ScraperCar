package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.SentAnnouncementModel;
import com.august.ScraperCar.model.UserAlerts;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SentAnnouncementRepository extends JpaRepository<SentAnnouncementModel, Long> {
    boolean existsByUserAlertsIdAndAnuncioId(Long userAlertsId, String anuncioId);

    void deleteByUserAlertsId(Long userAlertsId);

    void  deleteBySentAtBefore(LocalDateTime sentAt);

    Optional<SentAnnouncementModel> findByUserAlertsAndAnuncioId(UserAlerts alerta, String anuncioId);
}
