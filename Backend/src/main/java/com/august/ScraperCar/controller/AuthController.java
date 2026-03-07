package com.august.ScraperCar.controller;


import com.august.ScraperCar.dto.request.UserCreateRequestDTO;
import com.august.ScraperCar.dto.request.UserLoginRequestDTO;
import com.august.ScraperCar.dto.response.UserCreateResponseDTO;
import com.august.ScraperCar.dto.response.UserLoginResponseDTO;
import com.august.ScraperCar.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    public final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/cadastro")
    public UserCreateResponseDTO cadastrar(@RequestBody UserCreateRequestDTO dto) {
        return userService.cadastro(dto);
    }

    @PostMapping("/login")
    public UserLoginResponseDTO login(@RequestBody UserLoginRequestDTO dto) {
        return userService.login(dto);
    }
}
