package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.MarcasModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<MarcasModel, Integer> {
}
