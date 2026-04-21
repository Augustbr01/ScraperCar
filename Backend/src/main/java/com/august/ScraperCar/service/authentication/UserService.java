package com.august.ScraperCar.service.authentication;

import com.august.ScraperCar.dto.authentication.request.RefreshRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserCreateRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserLoginRequestDTO;
import com.august.ScraperCar.dto.authentication.response.RefreshResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserCreateResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserLoginResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.model.VerifyCodeModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.repository.VerifyCodeRepository;
import com.august.ScraperCar.service.wpp.VerifyService;
import com.august.ScraperCar.util.PepperUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class UserService {

    private final VerifyService verifyService;
    private final VerifyCodeRepository verifyCodeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PepperUtil pepperUtil;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${WPP_NUMERO}")
    private String NUMERODOBOT;

    private static final BigDecimal limite_numero = new BigDecimal("999999999999");

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PepperUtil pepperUtil,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            VerifyService verifyService,
            VerifyCodeRepository verifyCodeRepository)
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.pepperUtil = pepperUtil;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.verifyService = verifyService;
        this.verifyCodeRepository = verifyCodeRepository;
    }

    @Transactional
    public UserCreateResponseDTO cadastro(UserCreateRequestDTO dto) {

        validarTelefone(dto.getTelefone());

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Email já cadastrado", 409);
        }

        if (userRepository.existsByTelefone(dto.getTelefone())) {
            throw new BusinessException("Telefone já cadastrado", 409);
        }

        UserModel newUser = new UserModel();
        newUser.setNome(dto.getNome());
        newUser.setSenha(passwordEncoder.encode(pepperUtil.aplicar(dto.getSenha())));
        newUser.setEmail(dto.getEmail());
        newUser.setTelefone(dto.getTelefone());
        UserModel savedUser = userRepository.save(newUser);

        String codigo = verifyService.gerarCodigo();

        verifyService.salvarCodigo(savedUser, codigo);

        return new UserCreateResponseDTO(
                savedUser.getId(),
                savedUser.getNome(),
                savedUser.getEmail(),
                savedUser.getTelefone(),
                codigo,
                NUMERODOBOT
        );
    }

    public UserLoginResponseDTO login(UserLoginRequestDTO dto) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), pepperUtil.aplicar(dto.senha()))
            );
        } catch (Exception e) {
            throw new BusinessException("Email ou senha inválido!", 401);
        }

        UserModel userAutenticado = (UserModel) auth.getPrincipal();
        if (userAutenticado == null) {
            throw new BusinessException("Erro ao recuperar usuário autenticado", 500);
        }

        String role = Objects.requireNonNull(auth.getAuthorities().iterator().next().getAuthority())
                .replace("ROLE_", "");

        String accessToken = jwtService.gerarToken(dto.email(), role, userAutenticado.getVerificado());
        String refreshToken = jwtService.gerarRefreshToken(dto.email(), role);

        return new UserLoginResponseDTO(accessToken, refreshToken, dto.email(), userAutenticado.getVerificado());
    }

    public RefreshResponseDTO refresh(RefreshRequestDTO dto) {
        if (!jwtService.isRefreshToken(dto.refreshToken())) {
            throw new BusinessException("Refresh token inválido", 401);
        }

        String email = jwtService.extrairEmail(dto.refreshToken());
        String role = jwtService.extrairRole(dto.refreshToken());

        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", 404));

        return new RefreshResponseDTO(
                jwtService.gerarToken(email, role, user.getVerificado()),
                jwtService.gerarRefreshToken(email, role)
        );
    }

    private void validarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            throw new IllegalArgumentException("Telefone não pode ser vazio");
        }
        if (!telefone.matches("\\d+")) { // telefone só deve ter inteiros
            throw new IllegalArgumentException("Telefone deve conter apenas números");
        }
        if (new BigDecimal(telefone).compareTo(limite_numero) > 0) {
            throw new IllegalArgumentException("Telefone inválido");
        }
    }
}