package com.august.ScraperCar.service;

import com.august.ScraperCar.dto.scraper.ScraperResult;
import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.repository.SharedJobRepository;
import com.august.ScraperCar.service.ad.AdProcessorService;
import com.august.ScraperCar.service.scraper.ScrapingService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class JobExecutor implements Job {

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            Long jobId = context.getMergedJobDataMap().getLong("jobId");

            Thread.sleep((jobId % 30) * 1000L);

            log.info("\uD83D\uDE80 SearchJob executando jobId: " + jobId);

            ApplicationContext ctx = (ApplicationContext) context
                    .getScheduler()
                    .getContext()
                    .get("applicationContext");

            SharedJobRepository jobRepo = ctx.getBean(SharedJobRepository.class);
            ScrapingService scrapingService = ctx.getBean(ScrapingService.class);
            AdProcessorService adProcessorService = ctx.getBean(AdProcessorService.class);

            SharedSearchJobModel job = jobRepo.findById(jobId).orElseThrow();
            log.info("✅ Job encontrado: {}", job.getVeiculoKey());

            ScraperResult result = scrapingService.getAnuncios(job);

            adProcessorService.processar(job, result);


        } catch (Exception e) {
            log.error("❌ Erro SearchJob: ", e);
            throw new JobExecutionException(e);
        }
    }
}
