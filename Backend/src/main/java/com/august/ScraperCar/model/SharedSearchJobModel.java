package com.august.ScraperCar.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shared_search_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SharedSearchJobModel {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String veiculoKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marca_id")
    private MarcasModel marca;

    private String modelo;
    private String versao;
    private BigDecimal valorinicio;
    private BigDecimal valorfim;
    private Integer anoMin;
    private Integer anoMax;
    private String kminicio;
    private String kmfim;

    @Column(nullable = false)
    private Integer intervalo;

    private boolean ativo = true;
    private LocalDateTime lastRunAt;
    private LocalDateTime createdAt = LocalDateTime.now();
}

