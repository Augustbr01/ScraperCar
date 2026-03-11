package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.SharedSearchJobModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SharedJobRepository extends JpaRepository<SharedSearchJobModel, Long> {
    Optional<SharedSearchJobModel> findByVeiculoKey(String veiculoKey);
}
