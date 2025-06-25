package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.OneIoTResponseTelemetryLatest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TelemetryService {
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Scheduled(fixedRate = 15 * 60 * 1000) // 15 mins
    public void fetchHistoricalTelemetryAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        for (Device device : devices) {
            fetchHistoricalTelemetry(device.getDeviceId(), 20);
        }
    }

    /**
     * Method to fetch and save data of the specific devices to the database which take 2 params to form an URL
     * @param deviceId
     * @param total
     */
    public void fetchHistoricalTelemetry(String deviceId, int total) {
        String url = "https://oneiot.com.vn:9443/public/device/getContentByDeviceId/"
                + deviceId + "?total=" + total;

        Optional<Device> deviceOpt = deviceRepository.findByDeviceId(deviceId);
        if (deviceOpt.isEmpty()) return;

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(deviceOpt.get().getAccessToken());

        HttpEntity<Void> request = new HttpEntity<>(httpHeaders);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> root = mapper.readValue(response.getBody(), new TypeReference<>() {});
                List<Map<String, Object>> telemetryList = (List<Map<String, Object>>) root.get("contentInstanceList");

                for (Map<String, Object> record : telemetryList) {
                    Map<String, Object> content = new ObjectMapper().readValue(
                            record.get("content").toString(), new TypeReference<>() {}
                    );

                    String timestampStr = (String) content.get("timestamp");
                    LocalDateTime timestamp = LocalDateTime.parse(timestampStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                    if (telemetryRepository.findByDeviceIdAndTimestamp(deviceId, timestamp).isPresent()) continue;

                    Telemetry telemetry = new Telemetry();
                    telemetry.setDeviceId(deviceId);
                    telemetry.setTimestamp(timestamp);

                    telemetry.setCo(getDouble(content, "CO"));
                    telemetry.setSo2(getDouble(content, "SO2"));
                    telemetry.setNo2(getDouble(content, "NO2"));
                    telemetry.setO3(getDouble(content, "O3"));
                    telemetry.setPm25(getDouble(content, "PM2_5"));
                    telemetry.setPm10(getDouble(content, "PM10"));
                    telemetry.setLatitude(getDouble(content, "latitude"));
                    telemetry.setLongitude(getDouble(content, "longitude"));

                    applyAqiCalculations(telemetry);
                    telemetryRepository.save(telemetry);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Method to fetch the latest content of the selected device/ station
     * @param deviceId
     */
    public void fetchAndStoreLatestFromOneIoT(String deviceId) {
        String url = "https://oneiot.com.vn:9443/public/device/cti/getCtiLatestByDevice/" + deviceId;

        Optional<Device> device = deviceRepository.findByDeviceId(deviceId);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(device.get().getAccessToken());

        HttpEntity<Void> request = new HttpEntity<>(httpHeaders);

        ResponseEntity<OneIoTResponseTelemetryLatest> response =
                restTemplate.exchange(url, HttpMethod.GET, request, OneIoTResponseTelemetryLatest.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            OneIoTResponseTelemetryLatest oneIoT = response.getBody();

            if (oneIoT.getErrorCode() == 0) {
                ObjectMapper mapper = new ObjectMapper();
                try {
                    Map<String, Object> contentMap = mapper.readValue(oneIoT.getContent(), new TypeReference<>() {});
                    String timestampStr = (String) contentMap.get("timestamp");
                    LocalDateTime timestamp = LocalDateTime.parse(timestampStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                    if (telemetryRepository.findByDeviceIdAndTimestamp(deviceId, timestamp).isPresent())
                        return;

                    Telemetry telemetry = new Telemetry();
                    telemetry.setDeviceId(deviceId);
                    telemetry.setTimestamp(timestamp);

                    telemetry.setCo(getDouble(contentMap, "CO"));
                    telemetry.setSo2(getDouble(contentMap, "SO2"));
                    telemetry.setNo2(getDouble(contentMap, "NO2"));
                    telemetry.setO3(getDouble(contentMap, "O3"));
                    telemetry.setPm25(getDouble(contentMap, "PM2_5"));
                    telemetry.setPm10(getDouble(contentMap, "PM10"));
                    telemetry.setLatitude(getDouble(contentMap, "latitude"));
                    telemetry.setLongitude(getDouble(contentMap, "longitude"));

                    applyAqiCalculations(telemetry);
                    telemetryRepository.save(telemetry);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Method to calculate the percentage of polluted based on AqiThreshold set up by user, Date and Station
     * @param deviceId
     * @param date
     * @param aqiThreshold
     * @return polluted time percentage
     */
    public double calculatePollutedTimePercentage(String deviceId, LocalDate date, int aqiThreshold) {
        // Fetch telemetry data for the specific device and date
        List<Telemetry> telemetryData = telemetryRepository.findByDeviceIdAndDate(deviceId, date);

        if (telemetryData.isEmpty()) {
            return 0.0;
        }

        // Count the number of entries that are considered polluted based on the AQI threshold
        long pollutedCount = telemetryData.stream()
                .filter(telemetry -> telemetry.getOverallAqi() > aqiThreshold)
                .count();

        // Calculate the polluted time percentage
        return (double) pollutedCount / telemetryData.size() * 100;
    }

    /**
     * Utility method to calculate the AQI
     * @param telemetry
     */
    public void applyAqiCalculations(Telemetry telemetry) {
        int aqiPm25 = AqiCalculator.aqiPm25(telemetry.getPm25());
        int aqiPm10 = AqiCalculator.aqiPm10(telemetry.getPm10());
        int aqiCo   = AqiCalculator.aqiCo(telemetry.getCo());
        int aqiSo2  = AqiCalculator.aqiSo2(telemetry.getSo2());
        int aqiNo2  = AqiCalculator.aqiNo2(telemetry.getNo2());
        int aqiO3   = AqiCalculator.aqiO3(telemetry.getO3());

        telemetry.setAqiPm25(aqiPm25);
        telemetry.setAqiPm10(aqiPm10);
        telemetry.setAqiCo(aqiCo);
        telemetry.setAqiSo2(aqiSo2);
        telemetry.setAqiNo2(aqiNo2);
        telemetry.setAqiO3(aqiO3);

        int overall = Collections.max(List.of(aqiPm25, aqiPm10, aqiCo, aqiSo2, aqiNo2, aqiO3));
        telemetry.setOverallAqi(overall);
    }

    /**
     * Method to calculate average AQI and pollutant levels for a device on a given date
     * @param deviceId ID of the device/station
     * @param date the date to compute averages for
     * @return a map of average values
     */
    public Map<String, Double> calculateAverageAqiAndPollutants(String deviceId, LocalDate date) {
        List<Telemetry> telemetryData = telemetryRepository.findByDeviceIdAndDate(deviceId, date);

        if (telemetryData.isEmpty()) return Collections.emptyMap();

        Map<String, Double> averages = new HashMap<>();
        averages.put("averageAqi", calculateAverageAqi(telemetryData));
        averages.put("averagePm25", calculateAverageField(telemetryData, "pm25"));
        averages.put("averagePm10", calculateAverageField(telemetryData, "pm10"));
        averages.put("averageCo", calculateAverageField(telemetryData, "co"));
        averages.put("averageNo2", calculateAverageField(telemetryData, "no2"));
        averages.put("averageSo2", calculateAverageField(telemetryData, "so2"));
        averages.put("averageO3", calculateAverageField(telemetryData, "o3"));

        return averages;
    }

    /**
     * Method to calculate weekly AQI (average, highest, and lowest) for a device
     * @param deviceId ID of the device/station
     * @param startDate the start date for the weekly calculation
     * @return a map containing the average AQI, highest AQI, and lowest AQI for the week
     */
    public Map<String, Double> calculateWeeklyAqi(String deviceId, LocalDate startDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = startDate.plusDays(6).atTime(23, 59, 59);

        List<Telemetry> telemetryData = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId, startDateTime, endDateTime);

        if (telemetryData.isEmpty()) return Collections.emptyMap();

        double totalAqi = 0;
        double highestAqi = Double.MIN_VALUE;
        double lowestAqi = Double.MAX_VALUE;

        // Iterate through all telemetry data for the week
        for (Telemetry telemetry : telemetryData) {
            double aqi = telemetry.getOverallAqi();

            totalAqi += aqi;
            highestAqi = Math.max(highestAqi, aqi);
            lowestAqi = Math.min(lowestAqi, aqi);
        }

        // Calculate the average AQI and round the values to 2 decimal places
        double averageAqi = totalAqi / telemetryData.size();
        averageAqi = Math.round(averageAqi * 100.0) / 100.0;

        highestAqi = Math.round(highestAqi * 100.0) / 100.0;
        lowestAqi = Math.round(lowestAqi * 100.0) / 100.0;

        // Put the calculated values into the map
        Map<String, Double> weeklyAqi = new HashMap<>();
        weeklyAqi.put("averageAqi", averageAqi);
        weeklyAqi.put("highestAqi", highestAqi);
        weeklyAqi.put("lowestAqi", lowestAqi);

        return weeklyAqi;
    }

    /**
     * Method to calculate weekly pollutant averages for the selected device in the past 7 days
     * @param deviceId ID of the device/station
     * @param startDate the start date for the weekly calculation
     * @return a map of average pollutant concentrations (PM2.5, PM10, CO, NO2, SO2, O3)
     */
    public Map<String, Double> calculateWeeklyPollutants(String deviceId, LocalDate startDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = startDate.plusDays(6).atTime(23, 59, 59);

        List<Telemetry> telemetryData = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId, startDateTime, endDateTime);

        if (telemetryData.isEmpty()) return Collections.emptyMap();

        Map<String, Double> pollutantAverages = new HashMap<>();
        pollutantAverages.put("averagePm25", calculateAverageField(telemetryData, "pm25"));
        pollutantAverages.put("averagePm10", calculateAverageField(telemetryData, "pm10"));
        pollutantAverages.put("averageCo", calculateAverageField(telemetryData, "co"));
        pollutantAverages.put("averageNo2", calculateAverageField(telemetryData, "no2"));
        pollutantAverages.put("averageSo2", calculateAverageField(telemetryData, "so2"));
        pollutantAverages.put("averageO3", calculateAverageField(telemetryData, "o3"));

        return pollutantAverages;
    }


    /**
     * Utility method to avoid casting exceptions
     */
    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof Number ? ((Number) val).doubleValue() : null;
    }

    /**
     * Utility method to calculate average value of things
     */
    private double calculateAverageAqi(List<Telemetry> data) {
        return data.stream()
                .mapToInt(Telemetry::getOverallAqi)
                .average()
                .orElse(0);
    }

    private double calculateAverageField(List<Telemetry> data, String field) {
        return data.stream()
                .mapToDouble(t -> {
                    switch (field.toLowerCase()) {
                        case "pm25": return Optional.ofNullable(t.getPm25()).orElse(0.0);
                        case "pm10": return Optional.ofNullable(t.getPm10()).orElse(0.0);
                        case "co":   return Optional.ofNullable(t.getCo()).orElse(0.0);
                        case "no2":  return Optional.ofNullable(t.getNo2()).orElse(0.0);
                        case "so2":  return Optional.ofNullable(t.getSo2()).orElse(0.0);
                        case "o3":   return Optional.ofNullable(t.getO3()).orElse(0.0);
                        default: return 0.0;
                    }
                })
                .average()
                .orElse(0);
    }

}
