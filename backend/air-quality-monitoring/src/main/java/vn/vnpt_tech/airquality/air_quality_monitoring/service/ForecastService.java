package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Optional;
import java.util.ArrayList;

@Service
public class ForecastService {

//    private static final String FLASK_API_URL = "http://192.168.1.23:5000/forecast";
    private static final String FLASK_API_URL = "http://localhost:5000/forecast";

    private static final Logger logger = LoggerFactory.getLogger(ForecastService.class);

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private ForecastResultRepository forecastResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();


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
                getForecast(forecastRequest);
            }
        }
    }

    public Map<String, List<Double>> getForecast(ForecastRequest forecastRequest) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

        ZonedDateTime startTimeQuery = ZonedDateTime.parse(forecastRequest.getStartTime(), formatter);
        LocalDateTime startTimeLocal = startTimeQuery.toLocalDateTime();

        // Step 1: Check if the forecast is already stored in the database
        ForecastResult existingForecast = forecastResultRepository.findByDeviceIdAndCreationTimeWithTolerance(
                forecastRequest.getDeviceId(),
                startTimeLocal.minusMinutes(1), // Check 1 minute before
                startTimeLocal.plusMinutes(1),  // Check 1 minute after
                forecastRequest.getHorizon()
        );

        if (existingForecast != null) {
            logger.info("Using cached forecast for device {} and horizon {}", forecastRequest.getDeviceId(), forecastRequest.getHorizon());
            try {
                // Deserialize the JSON string back to a Map
                return objectMapper.readValue(existingForecast.getForecast(), new TypeReference<Map<String, List<Double>>>() {});
            } catch (JsonProcessingException e) {
                logger.error("Error deserializing forecast data", e);
                return null;
            }
        }

        RestTemplate restTemplate = new RestTemplate();
        String deviceId = forecastRequest.getDeviceId();
        String selectedPollutant = forecastRequest.getSelectedPollutant();

        // Step 2 & 3: Fetch recent telemetry data and interpolate
        ZonedDateTime endTime = ZonedDateTime.now(ZoneId.of("UTC"));
        ZonedDateTime startTimeForPrediction = endTime.minusHours(48);

        List<Telemetry> recentTelemetry = telemetryRepository.findByDeviceIdAndTimestampBetween(
                deviceId, startTimeForPrediction.toLocalDateTime(), endTime.toLocalDateTime());

        List<Telemetry> interpolatedData = interpolateMissingValues(recentTelemetry, startTimeForPrediction.toLocalDateTime(), endTime.toLocalDateTime());
        double[][] telemetryData = convertTelemetryToArray(interpolatedData);

        // Step 4: Prepare the request body to send to Flask API
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("recent_data", telemetryData);
        requestBody.put("horizon", forecastRequest.getHorizon());

        ResponseEntity<Map> response = restTemplate.postForEntity(FLASK_API_URL, requestBody, Map.class);
        Map<String, List<Double>> forecast = (Map<String, List<Double>>) response.getBody().get("forecast");

        // Step 5: Save the new forecast using the new 'createdAt' column
        ForecastResult newForecast = new ForecastResult();
        newForecast.setDeviceId(deviceId);
        newForecast.setCreatedAt(LocalDateTime.now());
        newForecast.setHorizon(forecastRequest.getHorizon());

        try {
            // Serialize the Map to a JSON string before saving
            newForecast.setForecast(objectMapper.writeValueAsString(forecast));
        } catch (JsonProcessingException e) {
            logger.error("Error serializing forecast data", e);
            // Handle this case appropriately, maybe by skipping the save
        }

        // Save the new entity
        forecastResultRepository.save(newForecast);
        return forecast;
    }

    /**
     * Interpolates missing values in a list of Telemetry data.
     */
    private List<Telemetry> interpolateMissingValues(List<Telemetry> telemetryList, LocalDateTime start, LocalDateTime end) {
        if (telemetryList.isEmpty()) {
            return new ArrayList<>();
        }

        // Tạo một danh sách mới để chứa dữ liệu đã được nội suy
        List<Telemetry> interpolatedList = new ArrayList<>(telemetryList);

        // Lặp qua từng thuộc tính và áp dụng nội suy
        interpolatedList = interpolateField(interpolatedList, "pm2.5");
        interpolatedList = interpolateField(interpolatedList, "pm10");
        interpolatedList = interpolateField(interpolatedList, "no2");
        interpolatedList = interpolateField(interpolatedList, "so2");
        interpolatedList = interpolateField(interpolatedList, "o3");
        interpolatedList = interpolateField(interpolatedList, "co");
        interpolatedList = interpolateField(interpolatedList, "overallAqi");
        interpolatedList = interpolateField(interpolatedList, "temperature");
        interpolatedList = interpolateField(interpolatedList, "humidity");
        interpolatedList = interpolateField(interpolatedList, "pressure");

        return interpolatedList;
    }

    /**
     * A helper method to perform linear interpolation on a specific field.
     */
    private List<Telemetry> interpolateField(List<Telemetry> data, String field) {
        for (int i = 0; i < data.size(); i++) {
            if (getFieldValue(data.get(i), field) == null) {
                int start = i - 1;
                while (start >= 0 && getFieldValue(data.get(start), field) == null) {
                    start--;
                }

                int end = i + 1;
                while (end < data.size() && getFieldValue(data.get(end), field) == null) {
                    end++;
                }

                if (start >= 0 && end < data.size()) {
                    Double startValue = getFieldValue(data.get(start), field);
                    Double endValue = getFieldValue(data.get(end), field);

                    if (startValue != null && endValue != null) {
                        double interpolatedValue = startValue + ((endValue - startValue) * (i - start) / (double) (end - start));
                        setFieldValue(data.get(i), field, interpolatedValue);
                    }
                }
            }
        }
        return data;
    }

    private Double getFieldValue(Telemetry telemetry, String field) {
        switch (field) {
            case "pm2.5": return telemetry.getPm25();
            case "pm10": return telemetry.getPm10();
            case "no2": return telemetry.getNo2();
            case "so2": return telemetry.getSo2();
            case "o3": return telemetry.getO3();
            case "co": return telemetry.getCo();
            case "overallAqi": return (double) telemetry.getOverallAqi(); // Convert int to double
            case "temperature": return telemetry.getTemperature();
            case "humidity": return telemetry.getHumidity();
            case "pressure": return telemetry.getPressure();
            default: return null;
        }
    }

    private void setFieldValue(Telemetry telemetry, String field, Double value) {
        if (value == null) return;
        switch (field) {
            case "pm2.5": telemetry.setPm25(value); break;
            case "pm10": telemetry.setPm10(value); break;
            case "no2": telemetry.setNo2(value); break;
            case "so2": telemetry.setSo2(value); break;
            case "o3": telemetry.setO3(value); break;
            case "co": telemetry.setCo(value); break;
            case "overallAqi": telemetry.setOverallAqi(value.intValue()); break;
            case "temperature": telemetry.setTemperature(value); break;
            case "humidity": telemetry.setHumidity(value); break;
            case "pressure": telemetry.setPressure(value); break;
        }
    }


    /**
     * Convert the telemetry list to the required format
     * @param telemetryList
     * @return required Telemetry Data for forecasting
     */
    private double[][] convertTelemetryToArray(List<Telemetry> telemetryList) {
        double[][] telemetryData = new double[telemetryList.size()][10];
        for (int i = 0; i < telemetryList.size(); i++) {
            Telemetry t = telemetryList.get(i);
            telemetryData[i][0] = t.getTemperature() != null ? t.getTemperature() : 0.0;
            telemetryData[i][1] = t.getHumidity() != null ? t.getHumidity() : 0.0;
            telemetryData[i][2] = t.getPressure() != null ? t.getPressure() : 0.0;
            telemetryData[i][3] = t.getPm25() != null ? t.getPm25() : 0.0;
            telemetryData[i][4] = t.getPm10() != null ? t.getPm10() : 0.0;
            telemetryData[i][5] = t.getNo2() != null ? t.getNo2() : 0.0;
            telemetryData[i][6] = t.getSo2() != null ? t.getSo2() : 0.0;
            telemetryData[i][7] = t.getO3() != null ? t.getO3() : 0.0;
            telemetryData[i][8] = t.getCo() != null ? t.getCo() : 0.0;
            telemetryData[i][9] = t.getOverallAqi() != null ? (double) t.getOverallAqi() : 0.0;
        }
        return telemetryData;
    }
}