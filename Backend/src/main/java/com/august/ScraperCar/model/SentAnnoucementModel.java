package com.august.ScraperCar.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="sent_announcement", uniqueConstraints = @UniqueConstraint(columnNames = {"user_alert_id", "anuncio_id"}))
public class SentAnnoucementModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @ManyToOne
    @JoinColumn(name = "user_alert_id", nullable = false)
    private UserAlerts userAlerts;

    @Column(unique = true)
    private String anuncio_id;
    private LocalDateTime sent_at = LocalDateTime.now();
}
