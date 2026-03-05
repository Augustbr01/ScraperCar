package com.august.ScraperCar.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "scrape_cache")
public class ScrapeCacheModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String veiculo_key;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String resultado;

    private LocalDateTime scrapedAt =  LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVeiculo_key() {
        return veiculo_key;
    }

    public void setVeiculo_key(String veiculo_key) {
        this.veiculo_key = veiculo_key;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public LocalDateTime getScrapedAt() {
        return scrapedAt;
    }

    public void setScrapedAt(LocalDateTime scrapedAt) {
        this.scrapedAt = scrapedAt;
    }


}
