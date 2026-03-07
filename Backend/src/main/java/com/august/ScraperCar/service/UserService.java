package com.august.ScraperCar.service;

import com.august.ScraperCar.config.SecurityConfig;
import com.august.ScraperCar.dto.UserCreateRequestDTO;
import com.august.ScraperCar.dto.response.UserCreateResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityConfig securityConfig;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, SecurityConfig securityConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityConfig = securityConfig;
    }

    public UserCreateResponseDTO cadastro(UserCreateRequestDTO dto) {

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Email já cadastrado", 409);
        }
        UserModel newUser = new UserModel();
        newUser.setNome(dto.getNome());
        newUser.setSenha(
                passwordEncoder.encode(
                        securityConfig.aplicarPepper(dto.getSenha())
                )
        );
        newUser.setEmail(dto.getEmail());
        newUser.setTelefone(dto.getTelefone());
        userRepository.save(newUser);

        return new UserCreateResponseDTO(
                newUser.getId(),
                newUser.getNome(),
                newUser.getEmail(),
                newUser.getTelefone()
        );
    }



}
