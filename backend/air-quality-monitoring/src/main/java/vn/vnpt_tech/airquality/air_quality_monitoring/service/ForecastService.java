package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForecastRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ForecastService {

    private static final String FLASK_API_URL = "http://localhost:5000/forecast";  // Flask API URL

    private static final Logger logger = LoggerFactory.getLogger(ForecastService.class);

    @Autowired
    private TelemetryRepository telemetryRepository;

    public List<Double> getForecast(ForecastRequest forecastRequest) {
        RestTemplate restTemplate = new RestTemplate();

        // Step 1: Fetch telemetry data from the database
        String deviceId = forecastRequest.getDeviceId();

        // Specify the expected format for parsing 'startTime' with DateTimeFormatter
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

        // Parse the startTime as ZonedDateTime (this can handle the 'Z' time zone if present)
        ZonedDateTime startTime;
        try {
            startTime = ZonedDateTime.parse(forecastRequest.getStartTime(), formatter);
        } catch (Exception e) {
            // If parsing fails, log the error and throw a BAD_REQUEST error
            logger.error("Error parsing startTime: {}", forecastRequest.getStartTime(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid startTime format");
        }

        // If you want to convert it to LocalDateTime (without time zone):
        LocalDateTime localStartTime = startTime.toLocalDateTime();

        // Calculate the end time based on horizon
        LocalDateTime endTime = localStartTime.plusHours(forecastRequest.getHorizon());

        // Log the fetched device and time window information
        logger.info("Fetching telemetry for device: {} from {} to {}", deviceId, localStartTime, endTime);

        List<Telemetry> recentTelemetry = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId, localStartTime, endTime);

        // Log the telemetry data retrieved
        logger.info("Fetched {} telemetry records for device: {}", recentTelemetry.size(), deviceId);

        // Step 2: Convert the telemetry data into a format suitable for Flask model
        double[][] telemetryData = convertTelemetryToArray(recentTelemetry);

        // Log the telemetry data being sent to Flask
        logger.debug("Sending telemetry data to Flask for forecasting: {}", (Object) telemetryData);

        // Step 3: Prepare the request body to send to Flask API
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("recent_data", telemetryData);
        requestBody.put("horizon", forecastRequest.getHorizon());

        // Send POST request to Flask API
        logger.info("Sending request to Flask API at: {}", FLASK_API_URL);
        ResponseEntity<Map> response = restTemplate.postForEntity(FLASK_API_URL, requestBody, Map.class);

        // Log the response from Flask API
        logger.info("Received response from Flask API: {}", response.getBody());

        // Extract the forecast data from the response
        List<Double> forecast = (List<Double>) response.getBody().get("forecast");

        // Log the forecast results
        logger.info("Forecasted AQI: {}", forecast);

        return forecast;
    }


    /**
     * Convert the telemetry list to the required format (e.g., a 2D array for the model)
     * @param telemetryList
     * @return required Telemetry Data for forecasting
     */
    private double[][] convertTelemetryToArray(List<Telemetry> telemetryList) {
        double[][] telemetryData = new double[telemetryList.size()][7];
        for (int i = 0; i < telemetryList.size(); i++) {
            Telemetry t = telemetryList.get(i);
            telemetryData[i][0] = t.getPm25();
            telemetryData[i][1] = t.getPm10();
            telemetryData[i][2] = t.getNo2();
            telemetryData[i][3] = t.getSo2();
            telemetryData[i][4] = t.getO3();
            telemetryData[i][5] = t.getCo();
            telemetryData[i][6] = t.getOverallAqi();
        }
        return telemetryData;
    }
}
