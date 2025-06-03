package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.vnpt_tech.airquality.air_quality_monitoring.controller.TelemetryController;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.OneIoTResponseTelemetryLatest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class TelemetryService {
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Value("${ONEIOT_ACCESS_TOKEN}")
    private String accessToken;

    public void fetchAndStoreLatestFromOneIoT(String deviceId+) {
        String url = "https://oneiot.com.vn:9443/public/device/cti/getCtiLatestByDevice/" + deviceId;

        // Headers with token
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(httpHeaders);

        ResponseEntity<OneIoTResponseTelemetryLatest> response =
                restTemplate.exchange(url, HttpMethod.GET, request, OneIoTResponseTelemetryLatest.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            OneIoTResponseTelemetryLatest oneIoT = response.getBody();

            if (oneIoT.getErrorCode() == 0) {
                // Parse JSON inside content
                ObjectMapper mapper = new ObjectMapper();
                try {
                    Map<String, Object> contentMap = mapper.readValue(oneIoT.getContent(), new TypeReference<>() {});
                    Telemetry telemetry = new Telemetry();

                    telemetry.setDeviceId(deviceId);
                    telemetry.setTimestamp(LocalDateTime.now());

                    telemetry.setCo(getDouble(contentMap, "CO"));
                    telemetry.setSo2(getDouble(contentMap, "SO2"));
                    telemetry.setNo2(getDouble(contentMap, "NO2"));
                    telemetry.setO3(getDouble(contentMap, "O3"));
                    telemetry.setPm25(getDouble(contentMap, "PM2_5"));
                    telemetry.setPm10(getDouble(contentMap, "PM10"));
                    telemetry.setLatitude(getDouble(contentMap, "latitude"));
                    telemetry.setLongitude(getDouble(contentMap, "longitude"));

                    applyAqiCalculations(telemetry); // from your existing controller

                    telemetryRepository.save(telemetry);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Utility method to calculate the AQI
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

    // Utility method to avoid casting exceptions
    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof Number ? ((Number) val).doubleValue() : null;
    }
}
