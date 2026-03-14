package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.ScrapeCacheModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScrapeCacheRepository extends JpaRepository<ScrapeCacheModel, Long> {
    Optional<ScrapeCacheModel> findByVeiculoKey(String veiculoKey);
}
