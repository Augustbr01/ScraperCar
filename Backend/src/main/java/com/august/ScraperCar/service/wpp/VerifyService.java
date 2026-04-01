package com.august.ScraperCar.service.wpp;

import com.august.ScraperCar.dto.wpp.ContactDTO;
import com.august.ScraperCar.dto.wpp.UserCodeGenDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.model.VerifyCodeModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.repository.VerifyCodeRepository;
import com.august.ScraperCar.service.authentication.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerifyService {

    @Value("${WPP_NUMERO}")
    private String NUMERODOBOT;

    private final UserRepository userRepository;
    private final WhatsAppService whatsAppService;
    private final JwtService jwtService;
    private final VerifyCodeRepository verifyCodeRepository;
    private final SecureRandom random = new SecureRandom();


    public VerifyService(UserRepository userRepository, WhatsAppService whatsAppService,  JwtService jwtService,  VerifyCodeRepository verifyCodeRepository) {
        this.userRepository = userRepository;
        this.whatsAppService = whatsAppService;
        this.jwtService = jwtService;
        this.verifyCodeRepository = verifyCodeRepository;
    }

    public String gerarCodigo() {
        int codigo = 100000 + random.nextInt(900000);
        return String.valueOf(codigo);
    }

    public UserCodeGenDTO solicitarGerador(String token) {
        String email = jwtService.extrairEmail(token);
        Optional<UserModel> userDB = userRepository.findByEmail(email);
        if (userDB.isEmpty()) {
            throw new BusinessException("Token invalido!", 401);
        }

        if (userDB.get().getVerificado()) {
            throw new BusinessException("Numero ja esta validado!", 401);
        }

        String codigo = gerarCodigo();

        try {
            salvarCodigo(userDB.get(), codigo);
        } catch (Exception e) {
            throw new BusinessException("Erro ao salvar!", 401);
        }

        return new UserCodeGenDTO(userDB.get().getTelefone(), NUMERODOBOT, codigo);
    }

    @Transactional
    public void processar(String from, String body) {

        ContactDTO contact = whatsAppService.buscarContato(from);

        String numero = contact.phoneNumber().id();

        String numeroformatado = normalizarNumero(numero);

        Optional<VerifyCodeModel> code = verifyCodeRepository.findByUserTelefone(numeroformatado);
        if (code.isEmpty()) {
            throw new BusinessException("Codigo nao gerado para este numero!", 404);

        }

        VerifyCodeModel codeDB = code.get();


        if (codeDB.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Codigo expirado!", 401);
        }

        if (!codeDB.getCodigo().equals(body)) {
            throw new BusinessException("Codigo invalido!", 401);
        }


        codeDB.getUser().setVerificado(true);
        userRepository.save(codeDB.getUser());
    }

    private String normalizarNumero(String numero) {

        String semPais = numero.startsWith("55") ? numero.substring(2) : numero;

        if (semPais.length() == 11) {
            return semPais;
        }

        if (semPais.length() == 10) {
            String ddd = semPais.substring(0, 2);
            String numerocru = semPais.substring(2);
            return ddd + "9" + numerocru;
        }

        return semPais;
    }

    public Boolean verificarTelefone(String telefone) {
        String telefoneNormal =  normalizarNumero(telefone);
        Optional<UserModel> user = userRepository.findByTelefone(telefoneNormal);
        if (user.isEmpty()) {
            throw new BusinessException("Telefone inexistente", 404);
        }

        return user.get().getVerificado();
    }

    public void salvarCodigo(UserModel user, String codigo) {

        Optional<VerifyCodeModel> exists = verifyCodeRepository.findByUserId(user.getId());

        exists.ifPresent(verifyCodeRepository::delete);

        VerifyCodeModel verifyCodeModel = new VerifyCodeModel();
        verifyCodeModel.setCodigo(codigo);
        verifyCodeModel.setUser(user);
        verifyCodeModel.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        verifyCodeRepository.save(verifyCodeModel);
    }

    @Transactional
    public UserCodeGenDTO trocarNumero (String token, String novoTelefone) {

        if (novoTelefone == null || novoTelefone.isBlank()) {
            throw new BusinessException("Telefone não pode ser nulo ou vazio!", 400);
        }

        String novoTelefoneNormalizado = normalizarNumero(novoTelefone);


        String email = jwtService.extrairEmail(token);
        Optional<UserModel> userDB = userRepository.findByEmail(email);





        if (userDB.isEmpty()) {
            throw new BusinessException("Token invalido!", 401);
        }

        System.out.println("USUARIO ENCONTRADO: " + userDB.get().getNome());

        if (userRepository.existsByTelefone(novoTelefoneNormalizado)) {
            throw new BusinessException("Telefone ja existente!", 401);
        }

        System.out.println("O telefone inserido é novo!");

        UserModel user = userDB.get();

        try {
            user.setTelefone(novoTelefoneNormalizado);
            userRepository.save(user);

        } catch (Exception e) {
            throw new BusinessException("Erro ao salvar!", 401);
        }

        String codigo = gerarCodigo();

        salvarCodigo(userDB.get(), codigo);

        return new UserCodeGenDTO(novoTelefone, NUMERODOBOT, codigo);
    }
}
