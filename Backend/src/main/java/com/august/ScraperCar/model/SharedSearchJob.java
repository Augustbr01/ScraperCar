package com.august.ScraperCar.model;


import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="shared_search_jobs")
public class SharedSearchJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String jobKey;

    @Column(nullable = false)
    private String veiculo_key;

    private String marca;

    private String modelo;

    private BigDecimal precoMin;

    private BigDecimal precoMax;

    private Integer ano_min;

    private Integer ano_max;

    private String intervalo;

    private boolean ativo;

    private LocalDateTime created_at = LocalDateTime.now();

}
