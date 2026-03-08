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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), senhacompepper)
        );

        // Se chegou aqui, autenticou com sucesso → gera o token
        String accessToken = jwtService.gerarToken(dto.email());
        String refreshToken = jwtService.gerarRefreshToken(dto.email());

        return new UserLoginResponseDTO(accessToken, refreshToken, dto.email());
    }

    public RefreshResponseDTO refresh(RefreshRequestDTO dto) {
        String refreshToken = dto.refreshToken();

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BusinessException("Refresh token invalido", 401);
        }

        String email = jwtService.extrairEmail(refreshToken).replace("REFRESH_", "");
        String novoAccess = jwtService.gerarToken(email);
        String novoRefresh = jwtService.gerarRefreshToken(email);

        return new RefreshResponseDTO(novoAccess, novoRefresh);
    }
}
