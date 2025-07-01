package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;

import java.io.Serializable;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO  {
    private String deviceId;
    private String stationName;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String lastUpdatedDate;
    private Integer overallAqi;

    // In-memory cache for geocoding results
    private static final Map<String, String> geocodeCache = new ConcurrentHashMap<>();

    // Construct the desired DeviceDTO to support the display on the FE
    public DeviceDTO(Device device, Telemetry telemetry) {
        this.deviceId = device.getDeviceId();
        this.stationName = device.getStationName();
        this.latitude = device.getLatitude();
        this.longitude = device.getLongitude();
        this.overallAqi = telemetry.getOverallAqi();

        if (device.getLatitude() != null && device.getLongitude() != null) {
            this.locationName = reverseGeocode(device.getLatitude(), device.getLongitude());
        } else {
            this.locationName = "Unknown Location";
        }

        if (telemetry.getTimestamp() != null) {
            this.lastUpdatedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
        } else {
            this.lastUpdatedDate = "N/A";
        }

    }

    /**
     * Convert back from lat and lon value to actual location name for display (using Nomitanim)
     * @param lat
     * @param lon
     * @return
     */
    public String reverseGeocode(double lat, double lon) {
        String cacheKey = lat + "," + lon;

        // Check if the location is already cached
        if (geocodeCache.containsKey(cacheKey)) {
            return geocodeCache.get(cacheKey);
        }

        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?lat=%f&lon=%f&format=json&zoom=14&addressdetails=1&lang=en",
                    lat, lon
            );

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "AirQualityMonitoringApp/1.0 (nnguyendang318@gmail.com)");
            headers.add("Accept-Language", "en");

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            Map<String, Object> result = response.getBody();

            if (result != null && result.containsKey("display_name")) {
                return result.get("display_name").toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return String.format("Unknown Address for (%.4f, %.4f)", lat, lon);
    }
}
