package com.august.ScraperCar.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="sent_announcement", uniqueConstraints = @UniqueConstraint(columnNames = {"user_alert_id", "anuncio_id"}))
public class SentAnnouncementModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @ManyToOne
    @JoinColumn(name = "user_alert_id", nullable = false)
    private UserAlerts userAlerts;

    @Column(unique = true)
    private String anuncio_id;
    private LocalDateTime sent_at = LocalDateTime.now();

    public Long getId() {
        return Id;
    }

    public void setId(Long id) {
        Id = id;
    }

    public UserAlerts getUserAlerts() {
        return userAlerts;
    }

    public void setUserAlerts(UserAlerts userAlerts) {
        this.userAlerts = userAlerts;
    }

    public String getAnuncio_id() {
        return anuncio_id;
    }

    public void setAnuncio_id(String anuncio_id) {
        this.anuncio_id = anuncio_id;
    }

    public LocalDateTime getSent_at() {
        return sent_at;
    }

    public void setSent_at(LocalDateTime sent_at) {
        this.sent_at = sent_at;
    }
}
