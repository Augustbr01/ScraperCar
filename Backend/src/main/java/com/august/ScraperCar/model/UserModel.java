package com.august.ScraperCar.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="users")
public class UserModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true, nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String role = "USER";

    private LocalDateTime createdAt = LocalDateTime.now();
}
