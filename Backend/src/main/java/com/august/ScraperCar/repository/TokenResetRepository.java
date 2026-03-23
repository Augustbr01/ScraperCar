package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.TokenResetModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TokenResetRepository extends JpaRepository<TokenResetModel, Long> {
    Optional<TokenResetModel> findByToken(String token);
    Optional<TokenResetModel> findByUser_Id(UUID userId);
}
