package com.august.ScraperCar.dto.wpp;

public record  WppWebHookDTO(String event,
                             String session,
                             String type,
                             String body,
                             String from,
                             String to,
                             Boolean isGroupMsg,
                             Boolean fromMe
) {

}
