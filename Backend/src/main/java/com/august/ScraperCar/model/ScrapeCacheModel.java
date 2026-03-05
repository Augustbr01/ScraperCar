package com.august.ScraperCar.model;

import jakarta.persistence.*;

import javax.annotation.processing.Generated;
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
}
