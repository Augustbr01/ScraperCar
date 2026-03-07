package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.SharedSearchJobModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SharedJobRepository extends JpaRepository<SharedSearchJobModel, Long> {
}
