package vn.vnpt_tech.airquality.air_quality_monitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableCaching
@SpringBootApplication
public class AirQualityMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(AirQualityMonitoringApplication.class, args);
	}

}
