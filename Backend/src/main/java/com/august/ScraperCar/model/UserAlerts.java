package com.august.ScraperCar.model;


import jakarta.persistence.*;
import org.apache.catalina.User;

import javax.swing.text.StyledEditorKit;
import java.time.LocalDateTime;

@Entity @Table(name = "user_alerts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"}))

public class UserAlerts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserModel user;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private SharedSearchJob job;

    private Boolean ativo;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "userAlert")
    private List<SentAnnouncement> anunciosEnviados;
}