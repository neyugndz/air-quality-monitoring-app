package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.vnpt_tech.airquality.air_quality_monitoring.controller.TelemetryController;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.OneIoTResponseTelemetryLatest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
     * Utility method to avoid casting exceptions
     */
    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof Number ? ((Number) val).doubleValue() : null;
    }
}
