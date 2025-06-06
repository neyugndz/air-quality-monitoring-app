package vn.vnpt_tech.airquality.air_quality_monitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AirQualityMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(AirQualityMonitoringApplication.class, args);
	}

}
