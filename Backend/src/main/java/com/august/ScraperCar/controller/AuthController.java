package com.august.ScraperCar.controller;


import com.august.ScraperCar.dto.authentication.request.RefreshRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserCreateRequestDTO;
import com.august.ScraperCar.dto.authentication.request.UserLoginRequestDTO;
import com.august.ScraperCar.dto.authentication.response.RefreshResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserCreateResponseDTO;
import com.august.ScraperCar.dto.authentication.response.UserLoginResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.service.authentication.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/cadastro")
    public UserCreateResponseDTO cadastrar(@RequestBody UserCreateRequestDTO dto,
                                           HttpServletRequest request) {

        return userService.cadastro(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDTO> login(@RequestBody UserLoginRequestDTO dto,
                                                      HttpServletRequest request,
                                                      HttpServletResponse response
    ) {

        UserLoginResponseDTO result = userService.login(dto);

        response.addCookie(criarRefreshCookie(result.refreshToken()));

        return ResponseEntity.ok(new UserLoginResponseDTO(
                result.accessToken(),
                null,
                result.email()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDTO> refresh(HttpServletRequest request, HttpServletResponse response) {

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
        response.addCookie(criarRefreshCookie(result.refreshToken()));

        return ResponseEntity.ok(new RefreshResponseDTO(result.accessToken(), null));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/auth/refresh");
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logout realizado"));
    }

    private Cookie criarRefreshCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(30 * 24 * 60 * 60);
        return cookie;
    }
}
