package com.august.ScraperCar.service.scraper.wpp;

import com.august.ScraperCar.dto.wpp.ContactDTO;
import com.august.ScraperCar.exception.BusinessException;
import com.august.ScraperCar.model.UserModel;
import com.august.ScraperCar.model.VerifyCodeModel;
import com.august.ScraperCar.repository.UserRepository;
import com.august.ScraperCar.repository.VerifyCodeRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerifyService {

    private final UserRepository userRepository;
    private final WhatsAppService whatsAppService;
    private final VerifyCodeRepository verifyCodeRepository;

    public VerifyService(UserRepository userRepository, WhatsAppService whatsAppService, VerifyCodeRepository verifyCodeRepository) {
        this.userRepository = userRepository;
        this.whatsAppService = whatsAppService;
        this.verifyCodeRepository = verifyCodeRepository;
    }

    public String gerarCodigo() {
        SecureRandom random = new SecureRandom();
        int codigo = 100000 + random.nextInt(99999);
        return String.valueOf(codigo);
    }

    public void processar(String from, String body) {
        System.out.println("Codigo recebido no webhook!");

        ContactDTO contact = whatsAppService.buscarContato(from);

        String numero = contact.phoneNumber().id();

        String numeroformatado = normalizarNumero(numero);

        Optional<VerifyCodeModel> code = verifyCodeRepository.findByUserTelefone(numeroformatado);
        if (code.isEmpty()) {
            System.out.println("Codigo nao gerado para este numero!");
            throw new BusinessException("Codigo nao gerado para este numero!", 404);

        }

        VerifyCodeModel codeDB = code.get();


        if (codeDB.getExpiresAt().isBefore(LocalDateTime.now())) {
            System.out.println("CODIGO EXPIRADO");
            throw new BusinessException("Codigo expirado!", 401);
        }

        if (!codeDB.getCodigo().equals(body)) {
            System.out.println("CODIGO INVALIDO");
            throw new BusinessException("Codigo invalido!", 401);
        }


        codeDB.getUser().setVerificado(true);
        System.out.println("Verificado para este numero!");
        userRepository.save(codeDB.getUser());
        System.out.println("Verificado com sucesso!");
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
        System.out.println("Verificando telefone para este numero! " + telefone);
        String telefoneNormal =  normalizarNumero(telefone);
        Optional<UserModel> user = userRepository.findByTelefone(telefoneNormal);
        if (user.isEmpty()) {
            throw new BusinessException("Telefone inexistente", 404);
        }
        System.out.println("Verificado: " + user.get().getVerificado());
        return user.get().getVerificado();
    }
}
