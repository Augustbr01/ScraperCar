package com.august.ScraperCar.controller;


import com.august.ScraperCar.dto.authentication.request.*;
import com.august.ScraperCar.dto.authentication.response.RefreshResponseDTO;
import com.august.ScraperCar.dto.authentication.response.ResetSenhaResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserCreateResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserLoginResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.service.authentication.UserService;
import com.august.ScraperCar.service.authentication.ValidationTokenResetService;
import com.august.ScraperCar.util.RefreshCookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final ValidationTokenResetService validationTokenResetService;
    private final RefreshCookieUtil  refreshCookieUtil;

    public AuthController(UserService userService, ValidationTokenResetService validationTokenResetService,  RefreshCookieUtil refreshCookieUtil) {
        this.userService = userService;
        this.validationTokenResetService = validationTokenResetService;
        this.refreshCookieUtil = refreshCookieUtil;
    }

    @PostMapping("/cadastro")
    public UserCreateResponseDTO cadastrar(@RequestBody UserCreateRequestDTO dto) {
        return userService.cadastro(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDTO> login(@RequestBody UserLoginRequestDTO dto,
                                                      HttpServletResponse response) {
        UserLoginResponseDTO result = userService.login(dto);

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookieUtil.criar(result.refreshToken()).toString());

        return ResponseEntity.ok(new UserLoginResponseDTO(
                result.accessToken(),
                null,
                result.email(),
                result.validPhone()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDTO> refresh(HttpServletRequest request,
                                                      HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new BusinessException("Refresh Token não encontrado", 401);
        }

        String refreshToken = Arrays.stream(cookies)
                .filter(c -> c.getName().equals("refreshToken"))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new BusinessException("Refresh Token não encontrado", 401));

        RefreshResponseDTO result = userService.refresh(new RefreshRequestDTO(refreshToken));

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookieUtil.criar(result.refreshToken()).toString());

        return ResponseEntity.ok(new RefreshResponseDTO(result.accessToken(), null));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookieUtil.apagar().toString());
        return ResponseEntity.ok(Map.of("message", "Logout realizado"));
    }


    @PostMapping("/resetsenha/solicitar")
    public ResponseEntity<ResetSenhaResponseDTO> solicitarSenhaNova(@RequestBody SolicitarResetDTO dto) {
        return ResponseEntity.ok().body(
                (validationTokenResetService.solicitarReset(dto.email()))
        );
    }

    @PostMapping("/resetsenha/confirmar")
    public ResponseEntity<ResetSenhaResponseDTO> resetSenha(@RequestBody ConfirmarResetDTO dto) {
        return ResponseEntity.ok().body(
                (validationTokenResetService.resetarSenha(dto.token(), dto.senhanova()))
        );
    }
}
