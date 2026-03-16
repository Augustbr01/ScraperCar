package com.august.ScraperCar.service;

import com.august.ScraperCar.model.SharedSearchJobModel;
import com.august.ScraperCar.repository.SharedJobRepository;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class SearchJob implements Job {

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            Long jobId = context.getMergedJobDataMap().getLong("jobId");
            log.info("\uD83D\uDE80 SearchJob executando jobId: " + jobId);

            ApplicationContext ctx = (ApplicationContext) context
                    .getScheduler()
                    .getContext()
                    .get("applicationContext");

            SharedJobRepository jobRepo = ctx.getBean(SharedJobRepository.class);
            SharedSearchJobModel job = jobRepo.findById(jobId).orElseThrow();
            log.info("✅ Job encontrado: {}", job.getVeiculoKey());
        } catch (Exception e) {
            log.error("❌ Erro SearchJob: ", e);
            throw new JobExecutionException(e);
        }
    }
}
