package com.august.ScraperCar.model;


import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="shared_search_jobs")
public class SharedSearchJobModel {
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJobKey() {
        return jobKey;
    }

    public void setJobKey(String jobKey) {
        this.jobKey = jobKey;
    }

    public String getVeiculo_key() {
        return veiculo_key;
    }

    public void setVeiculo_key(String veiculo_key) {
        this.veiculo_key = veiculo_key;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public BigDecimal getPrecoMin() {
        return precoMin;
    }

    public void setPrecoMin(BigDecimal precoMin) {
        this.precoMin = precoMin;
    }

    public BigDecimal getPrecoMax() {
        return precoMax;
    }

    public void setPrecoMax(BigDecimal precoMax) {
        this.precoMax = precoMax;
    }

    public Integer getAno_min() {
        return ano_min;
    }

    public void setAno_min(Integer ano_min) {
        this.ano_min = ano_min;
    }

    public Integer getAno_max() {
        return ano_max;
    }

    public void setAno_max(Integer ano_max) {
        this.ano_max = ano_max;
    }

    public String getIntervalo() {
        return intervalo;
    }

    public void setIntervalo(String intervalo) {
        this.intervalo = intervalo;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}
