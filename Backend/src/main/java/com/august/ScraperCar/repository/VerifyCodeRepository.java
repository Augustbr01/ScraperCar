package com.august.ScraperCar.repository;

import com.august.ScraperCar.model.VerifyCodeModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerifyCodeRepository extends JpaRepository<VerifyCodeModel, Long> {
    Optional<VerifyCodeModel> findByUserTelefone(String telefone);
}
