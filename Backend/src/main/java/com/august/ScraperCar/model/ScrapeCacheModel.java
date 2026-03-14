package com.august.ScraperCar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "scrape_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeCacheModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String veiculoKey;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String resultado;

    private LocalDateTime scrapedAt =  LocalDateTime.now();
}
