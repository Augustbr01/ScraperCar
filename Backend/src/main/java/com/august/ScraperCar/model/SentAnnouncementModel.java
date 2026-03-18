package com.august.ScraperCar.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sent_announcement",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_alert_id", "anuncio_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SentAnnouncementModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_alert_id", nullable = false)
    private UserAlerts userAlerts;

    @Column(nullable = false)
    private String anuncioId;

    private BigDecimal ultimoPreco;

    private LocalDateTime precoAtualizadoEm;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;
}
