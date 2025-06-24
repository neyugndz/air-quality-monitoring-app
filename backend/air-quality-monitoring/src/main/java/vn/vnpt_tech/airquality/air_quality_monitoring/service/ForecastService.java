package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForecastRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.ForecastResult;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.ForecastResultRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
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

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private ForecastResultRepository forecastResultRepository;

    @Scheduled(fixedRate = 3600000)
    public void updateForecast() {
        List<Device> devices = deviceRepository.findAll();

        for (Device device : devices) {
            String deviceId = device.getDeviceId();

            String startTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"));

            int[] horizons = {24, 72, 168};

            for (int horizon : horizons) {
                ForecastRequest forecastRequest = new ForecastRequest();
                forecastRequest.setDeviceId(deviceId);
                forecastRequest.setStartTime(startTime);
                forecastRequest.setHorizon(horizon);

                // Get the forecast data dynamically for each device and horizon
                List<Double> forecast = getForecast(forecastRequest);
            }
        }
    }

    public List<Double> getForecast(ForecastRequest forecastRequest) {
        // Convert the startTime to ZonedDateTime (this will handle the 'Z' time zone if present)
        DateTimeFormatter formatterDate = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

        ZonedDateTime startTimeQuery;
        try {
            startTimeQuery = ZonedDateTime.parse(forecastRequest.getStartTime(), formatterDate);
        } catch (Exception e) {
            logger.error("Error parsing startTime: {}", forecastRequest.getStartTime(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid startTime format");
        }

        // Convert ZonedDateTime to LocalDateTime (without time zone)
        LocalDateTime localStartTime = startTimeQuery.toLocalDateTime();

        // Calculate the ±1 hour tolerance range
        LocalDateTime startTimeMinusOneHour = localStartTime.minusHours(1);
        LocalDateTime startTimePlusOneHour = localStartTime.plusHours(1);

        // Convert LocalDateTime back to ZonedDateTime to use with UTC (Z)
        ZonedDateTime startTimeMinusOneHourUtc = startTimeMinusOneHour.atZone(ZoneId.of("UTC"));
        ZonedDateTime startTimePlusOneHourUtc = startTimePlusOneHour.atZone(ZoneId.of("UTC"));

        // Format the times in UTC with "Z" for Zulu time
        String startTimeMinusOneHourStr = startTimeMinusOneHourUtc.format(formatterDate);
        String startTimePlusOneHourStr = startTimePlusOneHourUtc.format(formatterDate);

        // Step 1: Check if the forecast is already stored in the database with ±1 hour tolerance
        ForecastResult existingForecast = forecastResultRepository.findByDeviceIdAndStartTimeWithTolerance(
                forecastRequest.getDeviceId(), startTimeMinusOneHourStr, startTimePlusOneHourStr, forecastRequest.getHorizon());


        if (existingForecast != null) {
            // Return the saved forecast if it exists
            return existingForecast.getForecast();
        }
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

        ZonedDateTime endTime = ZonedDateTime.now();  // End time should be now
        ZonedDateTime startTimeForPrediction = endTime.minusHours(forecastRequest.getHorizon()); // Start time based on horizon

        // Step 2: Fetch recent telemetry data from the database for the last `horizon` hours
        List<Telemetry> recentTelemetry = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId, startTimeForPrediction.toLocalDateTime(), endTime.toLocalDateTime());

        double[][] telemetryData = convertTelemetryToArray(recentTelemetry);

        // Step 3: Prepare the request body to send to Flask API
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("recent_data", telemetryData);
        requestBody.put("horizon", forecastRequest.getHorizon());

        ResponseEntity<Map> response = restTemplate.postForEntity(FLASK_API_URL, requestBody, Map.class);
        // Extract the forecast data from the response
        List<Double> forecast = (List<Double>) response.getBody().get("forecast");
        ForecastResult newForecast = new ForecastResult();
        newForecast.setDeviceId(deviceId);
        newForecast.setStartTime(forecastRequest.getStartTime());
        newForecast.setHorizon(forecastRequest.getHorizon());
        newForecast.setForecast(forecast);

        forecastResultRepository.save(newForecast);

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
