package com.august.ScraperCar.service;

import com.august.ScraperCar.repository.SentAnnouncementRepository;
import com.august.ScraperCar.repository.SharedJobRepository;
import com.august.ScraperCar.repository.UserAlertRepository;
import com.august.ScraperCar.service.scraper.ScrapingService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class SearchJob implements Job {

    @Autowired private SharedJobRepository  sharedJobRepository;
    @Autowired private UserAlertRepository userAlertsRepo;
    @Autowired private SentAnnouncementRepository sentRepo;
    @Autowired private ScrapingService scrapingService;
    @Autowired private WhatsAppService whatsappService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        
    }
}
