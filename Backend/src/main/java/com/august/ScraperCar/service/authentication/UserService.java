package com.august.ScraperCar.service.authentication;

import com.august.ScraperCar.config.SecurityConfig;
import com.august.ScraperCar.dto.authentication.request.RefreshRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserCreateRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserLoginRequestDTO;
import com.august.ScraperCar.dto.authentication.response.RefreshResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserCreateResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserLoginResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityConfig securityConfig;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SecurityConfig securityConfig,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    )
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityConfig = securityConfig;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public UserCreateResponseDTO cadastro(UserCreateRequestDTO dto) {

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Email já cadastrado", 409);
        }

        if (userRepository.existsByTelefone(dto.getTelefone())) {
            throw new BusinessException("Telefone ja cadastrado", 409);
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

    public UserLoginResponseDTO login(UserLoginRequestDTO dto) {
        // Aplica o pepper antes de autenticar, igual ao cadastro
        String senhacompepper = securityConfig.aplicarPepper(dto.senha());

        // O Spring Security valida email + senha automaticamente
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), senhacompepper)
            );
        } catch (Exception e) {
            throw new BusinessException("Email ou senha invalido!", 401);
        }


        String role = Objects.requireNonNull(auth.getAuthorities().iterator().next().getAuthority()).replace("ROLE_", "");

        // Se chegou aqui, autenticou com sucesso → gera o token
        String accessToken = jwtService.gerarToken(dto.email(), role);
        String refreshToken = jwtService.gerarRefreshToken(dto.email(), role);

        return new UserLoginResponseDTO(accessToken, refreshToken, dto.email());
    }

    public RefreshResponseDTO refresh(RefreshRequestDTO dto) {
        String refreshToken = dto.refreshToken();

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BusinessException("Refresh token invalido", 401);
        }

        String email = jwtService.extrairEmail(refreshToken).replace("REFRESH_", "");
        String role = jwtService.extrairRole(refreshToken);

        String novoAccess = jwtService.gerarToken(email,role);
        String novoRefresh = jwtService.gerarRefreshToken(email, role);

        return new RefreshResponseDTO(novoAccess, novoRefresh);
    }
}
