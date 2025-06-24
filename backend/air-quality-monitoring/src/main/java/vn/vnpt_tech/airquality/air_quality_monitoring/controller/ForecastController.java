package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForecastRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.ForecastService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {
    @Autowired
    private ForecastService forecastService;

    private static final Logger logger = LoggerFactory.getLogger(ForecastController.class);

    @Autowired
    private TelemetryRepository telemetryRepository;

    @PostMapping
    public List<Double> getForecast(@RequestBody ForecastRequest forecastRequest) {
        return forecastService.getForecast(forecastRequest);
    }

}
