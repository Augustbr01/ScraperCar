package com.august.ScraperCar.dto.authentication.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserCreateRequestDTO {
    private String nome;

    @Email
    private String email;
    private String telefone;
    private String senha;

}
