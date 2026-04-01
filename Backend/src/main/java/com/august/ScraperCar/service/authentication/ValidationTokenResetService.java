package com.august.ScraperCar.service.authentication;

import com.august.ScraperCar.dto.authentication.response.ResetSenhaResponseDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.TokenResetModel;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.repository.TokenResetRepository;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.util.PepperUtil;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service

public class ValidationTokenResetService {

    private final TokenResetRepository tokenResetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PepperUtil pepperUtil;

    public ValidationTokenResetService(TokenResetRepository tokenResetRepository,
                                       UserRepository userRepository,
                                       PasswordEncoder passwordEncoder,
                                       PepperUtil pepperUtil) {
        this.tokenResetRepository = tokenResetRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.pepperUtil = pepperUtil;
    }

    @Value("${RESEND_TOKEN}")
    private String RESEND_TOKEN;

    @Value("${URL_FRONTEND}")
    private String URL_FRONTEND;


    public ResetSenhaResponseDTO solicitarReset(String email)  {

        Resend resend = new Resend(RESEND_TOKEN);

        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Email não encontrado!", 404));

        Optional<TokenResetModel> existingToken = tokenResetRepository.findByUser_Id(user.getId());



        String token = gerarTokenReset();

        TokenResetModel tokenResetModel = new TokenResetModel();
        tokenResetModel.setToken(token);
        tokenResetModel.setExpiration(LocalDateTime.now().plusMinutes(15));
        tokenResetModel.setUser(user);

        if (existingToken.isPresent()) {
            TokenResetModel existing = existingToken.get();
            existing.setToken(token);
            existing.setExpiration(LocalDateTime.now().plusMinutes(15));
            tokenResetRepository.save(existing);
        } else {
            tokenResetRepository.save(tokenResetModel);
        }

        String[] urls = URL_FRONTEND.split(",");

        String link = urls[1] + "/resetsenha?token=" + token;

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("noreply@scrapercar.augustdev.com.br")
                .to(email)
                .subject("Seu email de recuperação de senha do ScraperCar")
                .html("<p>Clique no link para redefinir sua senha: </p> " +
                        "<a href= '" + link + "'> Redefinir Senha</a>" +
                        "<p>O link expira em 15 minutos.</p>")
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            throw new BusinessException("Erro ao enviar email!", 500);
        }

        return new ResetSenhaResponseDTO("Email de recuperação enviado!");
    }

    public ResetSenhaResponseDTO resetarSenha(String token, String senhanova) {


        String tokenLimpo = token.trim();

        Optional<TokenResetModel> tokenModel = tokenResetRepository.findByToken(tokenLimpo);

        if (tokenModel.isEmpty()) {
            System.out.println("❌ NÃO ACHOU TOKEN no banco!");
            throw new BusinessException("Token não existente!", 404);
        }

        if (tokenModel.get().getExpiration().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token expirado!", 401);
        }

        UserModel user = tokenModel.get().getUser();

        String senhacriptografada = passwordEncoder.encode(
                pepperUtil.aplicar(senhanova)
        );

        user.setSenha(senhacriptografada);
        userRepository.save(user);
        System.out.println("Senha atualizada com sucesso!");

        tokenResetRepository.delete(tokenModel.get());
        return new ResetSenhaResponseDTO("Senha atualizada com sucesso!");
    }

    private String gerarTokenReset() {
        return UUID.randomUUID().toString();
    }
}
