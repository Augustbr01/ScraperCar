package com.august.ScraperCar.service.authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.expiration}")
    private Long expiration;

    @Value("${security.refresh.expiration}")
    private Long refreshExpiration;

    private SecretKey secretKey;

    @PostConstruct
    private void init() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("Chave JWT deve ter pelo menos 32 bytes após decodificação Base64");
        }
        secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarToken(String email, String role, boolean verificado) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("type", "access")
                .claim("verificado", verificado)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    public String gerarRefreshToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(secretKey)
                .compact();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extrairRole(String token) {
        return extrairClaims(token).get("role", String.class);
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(extrairClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenValido(String token, String email) {
        try {
            String emailDoToken = extrairEmail(token);
            return emailDoToken.equals(email) && !isTokenExpirado(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpirado(String token) {
        return extrairClaims(token).getExpiration().before(new Date());
    }

    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean extrairVerificado(String token) {
        return extrairClaims(token).get("verificado", Boolean.class);
    }
}