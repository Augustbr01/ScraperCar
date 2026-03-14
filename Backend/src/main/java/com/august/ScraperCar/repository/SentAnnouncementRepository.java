package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.SentAnnouncementModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface SentAnnouncementRepository extends JpaRepository<SentAnnouncementModel, Long> {
    boolean existsByUserAlertsIdAndAnuncioId(Long userAlertsId, String anuncioId);

    void deleteByUserAlertsId(Long userAlertsId);

    void  deleteBySentAtBefore(LocalDateTime sentAt);
}
