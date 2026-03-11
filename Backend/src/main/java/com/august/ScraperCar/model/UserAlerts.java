package com.august.ScraperCar.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_alerts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "veiculo_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserAlerts {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserModel user;

    @ManyToOne
    @JoinColumn(name = "veiculo_key", referencedColumnName = "veiculoKey", nullable = false)
    private SharedSearchJobModel job;

    @Column(nullable = false)
    private Integer intervaloAlerta; // em minutos

    private LocalDateTime lastNotifiedAt;
    private Boolean ativo = true;
    private LocalDateTime createdAt = LocalDateTime.now();
}
