package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.stream.Collectors;

@Service
public class TelemetryService {

    private static final Logger logger = LoggerFactory.getLogger(TelemetryService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private ObjectMapper objectMapper;

//    @Scheduled(fixedRate = 15 * 60 * 1000) // 15 mins
//    public void fetchHistoricalTelemetryAllDevices() {
//        List<Device> devices = deviceRepository.findAll();
//        for (Device device : devices) {
//            fetchHistoricalTelemetry(device.getDeviceId(), 20);
//        }
//    }

    /**
     * Method to process and save data from MQTT broker.
     * Apply the strategy to save the raw data and give null value for missing values
     * @param deviceId
     * @param telemetryData // JSON body of response telemetry data
     */
    public void processAndSaveTelemetryFromMqtt(String deviceId, Map<String, Object> telemetryData ) {
        String timestampStr = (String) telemetryData.get("timestamp");
        if (timestampStr == null || timestampStr.trim().isEmpty()) {
            logger.warn("Received MQTT data for device {} with a missing timestamp. Skipping record.", deviceId);
            return;
        }

        try {
            LocalDateTime timestamp = LocalDateTime.parse(timestampStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            if (telemetryRepository.findByDeviceIdAndTimestamp(deviceId, timestamp).isPresent()) {
                logger.debug("Telemetry record for device {} at {} already exists. Skipping.", deviceId, timestamp);
                return;
            }

            Telemetry telemetry = new Telemetry();
            telemetry.setDeviceId(deviceId);
            telemetry.setTimestamp(timestamp);

            // Auto apply the null value if missing
            telemetry.setCo(getDouble(telemetryData, "CO"));
            telemetry.setSo2(getDouble(telemetryData, "SO2"));
            telemetry.setNo2(getDouble(telemetryData, "NO2"));
            telemetry.setO3(getDouble(telemetryData, "O3"));
            telemetry.setPm25(getDouble(telemetryData, "PM2_5"));
            telemetry.setPm10(getDouble(telemetryData, "PM10"));
            telemetry.setTemperature(getDouble(telemetryData, "temperature"));
            telemetry.setPressure(getDouble(telemetryData, "pressure"));
            telemetry.setHumidity(getDouble(telemetryData, "humidity"));
            telemetry.setLatitude(getDouble(telemetryData, "latitude"));
            telemetry.setLongitude(getDouble(telemetryData, "longitude"));

            // Calcuate the AQI (deal with null value here)
            applyAqiCalculations(telemetry);
            telemetryRepository.save(telemetry);
            logger.info("✅ Successfully processed and saved MQTT telemetry for device: {}", deviceId);

        } catch (Exception e) {
            logger.error("❌ Error processing MQTT telemetry data for device {}: {}", deviceId, e.getMessage(), e);
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
                Map<String, Object> root = objectMapper.readValue(response.getBody(), new TypeReference<>() {});
                List<Map<String, Object>> telemetryList = (List<Map<String, Object>>) root.get("contentInstanceList");

                for (Map<String, Object> record : telemetryList) {
                    Map<String, Object> content = objectMapper.readValue(
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
                try {
                    Map<String, Object> contentMap = objectMapper.readValue(oneIoT.getContent(), new TypeReference<>() {});
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
        // Wrap each value with a default if it's null
        int aqiPm25 = AqiCalculator.aqiPm25(Optional.ofNullable(telemetry.getPm25()).orElse(0.0));
        int aqiPm10 = AqiCalculator.aqiPm10(Optional.ofNullable(telemetry.getPm10()).orElse(0.0));
        int aqiCo   = AqiCalculator.aqiCo(Optional.ofNullable(telemetry.getCo()).orElse(0.0));
        int aqiSo2  = AqiCalculator.aqiSo2(Optional.ofNullable(telemetry.getSo2()).orElse(0.0));
        int aqiNo2  = AqiCalculator.aqiNo2(Optional.ofNullable(telemetry.getNo2()).orElse(0.0));
        int aqiO3   = AqiCalculator.aqiO3(Optional.ofNullable(telemetry.getO3()).orElse(0.0));

        // Then, set the AQI values
        telemetry.setAqiPm25(aqiPm25);
        telemetry.setAqiPm10(aqiPm10);
        telemetry.setAqiCo(aqiCo);
        telemetry.setAqiSo2(aqiSo2);
        telemetry.setAqiNo2(aqiNo2);
        telemetry.setAqiO3(aqiO3);

        // Filter out the 0 values before finding the maximum
        int overall = List.of(aqiPm25, aqiPm10, aqiCo, aqiSo2, aqiNo2, aqiO3)
                .stream()
                .filter(aqi -> aqi > 0)
                .max(Integer::compareTo)
                .orElse(0); // If all values are 0, the overall AQI is 0

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
     * Generates custom report data including chart data and statistics.
     *
     * @param deviceIds The list of device IDs.
     * @param pollutants The list of pollutants.
     * @param startDate The start date.
     * @param endDate The end date.
     * @return A map containing chart data and statistics.
     */
    public Map<String, Object> generateReportData(
            List<String> deviceIds, List<String> pollutants, LocalDate startDate, LocalDate endDate) {

        Map<String, List<Telemetry>> rawDataByDevice = new HashMap<>();
        Map<String, Map<String, Map<String, Double>>> statistics = new HashMap<>();

        for (String deviceId : deviceIds) {
            List<Telemetry> telemetryList = telemetryRepository.findByDeviceIdAndTimestampBetween(
                    deviceId, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
            rawDataByDevice.put(deviceId, telemetryList);
        }

        Map<String, List<Map<String, Object>>> chartData = new HashMap<>();

        for (Map.Entry<String, List<Telemetry>> entry : rawDataByDevice.entrySet()) {
            String deviceId = entry.getKey();
            List<Telemetry> telemetryList = entry.getValue();

            List<Map<String, Object>> deviceChartData = telemetryList.stream()
                    .map(telemetry -> {
                        Map<String, Object> dataPoint = new HashMap<>();
                        dataPoint.put("formattedDate", telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                        for (String pollutant : pollutants) {
                            switch (pollutant.toLowerCase()) {
                                case "pm25": dataPoint.put(pollutant, telemetry.getPm25()); break;
                                case "pm10": dataPoint.put(pollutant, telemetry.getPm10()); break;
                                case "co": dataPoint.put(pollutant, telemetry.getCo()); break;
                                case "so2": dataPoint.put(pollutant, telemetry.getSo2()); break;
                                case "no2": dataPoint.put(pollutant, telemetry.getNo2()); break;
                                case "o3": dataPoint.put(pollutant, telemetry.getO3()); break;
                                case "temperature": dataPoint.put(pollutant, telemetry.getTemperature()); break;
                                case "humidity": dataPoint.put(pollutant, telemetry.getHumidity()); break;
                                case "pressure": dataPoint.put(pollutant, telemetry.getPressure()); break;
                            }
                        }
                        return dataPoint;
                    })
                    .collect(Collectors.toList());

            chartData.put(deviceId, deviceChartData);

            for (String pollutant : pollutants) {
                // Calculate your average, min, and max values first
                double average = calculateAverageField(telemetryList, pollutant);
                double min = calculateMinField(telemetryList, pollutant);
                double max = calculateMaxField(telemetryList, pollutant);

                Map<String, Double> statsMap = new HashMap<>();
                statsMap.put("average", average);
                statsMap.put("min", min);
                statsMap.put("max", max);
                statistics.computeIfAbsent(pollutant, k -> new HashMap<>()).put(deviceId, statsMap);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("chartData", chartData);
        result.put("statistics", statistics);

        return result;
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

    private double calculateMinField(List<Telemetry> data, String field) {
        if (data.isEmpty()) {
            return Double.POSITIVE_INFINITY;
        }
        return data.stream()
                .mapToDouble(t -> {
                    switch (field.toLowerCase()) {
                        case "pm25": return Optional.ofNullable(t.getPm25()).orElse(Double.MAX_VALUE);
                        case "pm10": return Optional.ofNullable(t.getPm10()).orElse(Double.MAX_VALUE);
                        case "co": return Optional.ofNullable(t.getCo()).orElse(Double.MAX_VALUE);
                        case "no2": return Optional.ofNullable(t.getNo2()).orElse(Double.MAX_VALUE);
                        case "so2": return Optional.ofNullable(t.getSo2()).orElse(Double.MAX_VALUE);
                        case "o3": return Optional.ofNullable(t.getO3()).orElse(Double.MAX_VALUE);
                        case "temperature": return Optional.ofNullable(t.getTemperature()).orElse(Double.MAX_VALUE);
                        case "humidity": return Optional.ofNullable(t.getHumidity()).orElse(Double.MAX_VALUE);
                        case "pressure": return Optional.ofNullable(t.getPressure()).orElse(Double.MAX_VALUE);
                        default: return Double.MAX_VALUE;
                    }
                })
                .min()
                .orElse(0.0);
    }

    private double calculateMaxField(List<Telemetry> data, String field) {
        if (data.isEmpty()) {
            return Double.NEGATIVE_INFINITY;
        }
        return data.stream()
                .mapToDouble(t -> {
                    switch (field.toLowerCase()) {
                        case "pm25": return Optional.ofNullable(t.getPm25()).orElse(Double.MIN_VALUE);
                        case "pm10": return Optional.ofNullable(t.getPm10()).orElse(Double.MIN_VALUE);
                        case "co": return Optional.ofNullable(t.getCo()).orElse(Double.MIN_VALUE);
                        case "no2": return Optional.ofNullable(t.getNo2()).orElse(Double.MIN_VALUE);
                        case "so2": return Optional.ofNullable(t.getSo2()).orElse(Double.MIN_VALUE);
                        case "o3": return Optional.ofNullable(t.getO3()).orElse(Double.MIN_VALUE);
                        case "temperature": return Optional.ofNullable(t.getTemperature()).orElse(Double.MIN_VALUE);
                        case "humidity": return Optional.ofNullable(t.getHumidity()).orElse(Double.MIN_VALUE);
                        case "pressure": return Optional.ofNullable(t.getPressure()).orElse(Double.MIN_VALUE);
                        default: return Double.MIN_VALUE;
                    }
                })
                .max()
                .orElse(0.0);
    }
}
