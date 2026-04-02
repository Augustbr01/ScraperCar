package com.august.ScraperCar.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class ValidVeiculoService {
    private final JsonNode veiculoData;

    public ValidVeiculoService(JsonNode veiculoData) {
        this.veiculoData = veiculoData;
    }

    public boolean isValid(Integer marcaId, String modelo, String versao, int faixaano1, int faixaano2) {
        JsonNode carros = veiculoData.path("Carros");

        JsonNode marcaNode = findMarcaById(carros, marcaId);
        if (marcaNode == null) return false;


        JsonNode modelosNode = marcaNode.path("modelos");
        JsonNode modeloNode = modelosNode.path(modelo);
        if (modeloNode == null) return false;


        JsonNode versaoNode = modeloNode.path(versao);
        if (versaoNode.isMissingNode() || !versaoNode.isArray()) return false;


        Set<String> anosValidos = new HashSet<>();
        versaoNode.forEach(y -> anosValidos.add(y.asText()));


        if (faixaano1 > faixaano2) return false;

        return anosValidos.contains(String.valueOf(faixaano1))
                && anosValidos.contains(String.valueOf(faixaano2));
    }

    public JsonNode findMarcaById(JsonNode carros, Integer marcaId) {
        for (JsonNode marca : carros) {
            JsonNode idNode = marca.path("_id");
            if (!idNode.isMissingNode() && idNode.asInt() == marcaId) {
                return marca;
            }
        }
        return null;
    }
}
