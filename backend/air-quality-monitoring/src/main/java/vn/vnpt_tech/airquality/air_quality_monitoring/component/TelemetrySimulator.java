package vn.vnpt_tech.airquality.air_quality_monitoring.component;

import org.springframework.scheduling.annotation.Scheduled;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.TelemetryPublisherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class TelemetrySimulator {
    @Autowired
    private TelemetryPublisherService telemetryPublisherService;

    private Random random = new Random();

    @Scheduled(fixedRate = 10000)  // every 10 seconds
    public void sendFakeTelemetry() {
        double temperature = 20 + (40 - 20) * random.nextDouble();
        double humidity = 30 + (80 - 30) * random.nextDouble();

        String payload = String.format("{\"temperature\": %.2f, \"humidity\": %.2f}", temperature, humidity);
        telemetryPublisherService.publishTelemetry(payload);

        System.out.println("Published telemetry: " + payload);
    }
}
