package com.august.ScraperCar.service.authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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

    private SecretKey secretKey; // Cache para performance

    /**
     * Gera a chave secreta com cache e validação Base64
     */
    private SecretKey getSecretKey() {
        if (secretKey == null) {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
                // Verifica se a chave tem tamanho mínimo (256 bits = 32 bytes)
                if (keyBytes.length < 32) {
                    throw new IllegalArgumentException("Chave JWT deve ter pelo menos 32 bytes após decodificação Base64");
                }
                secretKey = Keys.hmacShaKeyFor(keyBytes);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("JWT Secret inválido: deve ser Base64 válido com 32+ bytes", e);
            }
        }
        return secretKey;
    }

    /**
     * Gera JWT token para o email informado
     */
    public String gerarToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSecretKey())
                .compact();
    }

    /**
     * Extrai email do token JWT
     */
    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    /**
     * Valida se token é válido para o email
     */
    public boolean isTokenValido(String token, String email) {
        try {
            String emailDoToken = extrairEmail(token);
            return emailDoToken.equals(email) && !isTokenExpirado(token);
        } catch (Exception e) {
            return false; // Token inválido ou malformado
        }
    }

    /**
     * Verifica se token expirou
     */
    private boolean isTokenExpirado(String token) {
        return extrairClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extrai claims do token (com verificação)
     */
    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String gerarRefreshToken(String email) {
        return Jwts.builder()
                .subject("REFRESH_" + email)
                .expiration(new Date(System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000))
                .signWith(getSecretKey())
                .compact();
    }

    public boolean isRefreshToken(String token) {
        try {
            String subject = extrairClaims(token).getSubject();
            return subject.startsWith("REFRESH_");
        } catch (Exception e) {
            return false;
        }
    }


}
