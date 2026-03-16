package com.august.ScraperCar.config;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import javax.sql.DataSource;
import java.util.Map;

//@Configuration
//@EnableScheduling
//public class QuartzConfig {

//    @Bean
//    public SchedulerFactoryBean schedulerFactoryBean(DataSource dataSource) {
 //       SchedulerFactoryBean factory = new SchedulerFactoryBean();
//        factory.setDataSource(dataSource);  // ← usa a mesma do JPA
//        factory.setConfigLocation(new ClassPathResource("quartz.properties"));
//
//        // Cria as 11 tabelas QRTZ_ na primeira inicialização
//        factory.setOverwriteExistingJobs(true);
//        return factory;
//    }
//}


@Configuration
@EnableScheduling
public class QuartzConfig {

    private final ApplicationContext applicationContext;

    public QuartzConfig(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Bean
    public SchedulerFactoryBean schedulerFactoryBean(DataSource dataSource) {
        SchedulerFactoryBean factory = new SchedulerFactoryBean();
        factory.setDataSource(dataSource);
        factory.setConfigLocation(new ClassPathResource("quartz.properties"));

        factory.setSchedulerContextAsMap(
                Map.of("applicationContext", applicationContext)
        );

        factory.setOverwriteExistingJobs(true);
        return factory;
    }
}