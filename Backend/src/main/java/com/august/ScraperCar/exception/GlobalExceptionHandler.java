package com.august.ScraperCar.exception;


import com.august.ScraperCar.dto.exception.ErrorResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<String> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception ex) {
        System.out.println("Erro inesperado: " + ex);
        return ResponseEntity.status(500)
                .body(new ErrorResponseDTO("Erro interno do servidor"));
    }
}
