package com.august.ScraperCar.model;


import jakarta.persistence.*;
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

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public UserModel getUser() {
        return user;
    }

    public void setUser(UserModel user) {
        this.user = user;
    }

    public SharedSearchJob getJob() {
        return job;
    }

    public void setJob(SharedSearchJob job) {
        this.job = job;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}