package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;

import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {
    private static final String DEVICE_KEY_PREFIX = "device:";
    private static final String TELEMETRY_KEY_PREFIX = "telemetry:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TelemetryService telemetryService;

    public void cacheDevice(DeviceDTO deviceDTO) {
        String key = DEVICE_KEY_PREFIX + deviceDTO.getDeviceId();
        redisTemplate.opsForValue().set(key, deviceDTO, 10, TimeUnit.MINUTES);
    }

    public DeviceDTO getCachedDevice(String deviceId) {
        Object cached = redisTemplate.opsForValue().get(DEVICE_KEY_PREFIX + deviceId);
        if (cached == null) return null;

        // Convert LinkedHashMap to Device safely
        return objectMapper.convertValue(cached, DeviceDTO.class);
    }

    /**
     * Cache the Telemetry object (not Optional) in Redis
     */
    public void cacheTelemetry(Telemetry telemetry, String deviceId) {
        if (telemetry != null) {
            telemetryService.applyAqiCalculations(telemetry);
            String key = TELEMETRY_KEY_PREFIX + deviceId;
            redisTemplate.opsForValue().set(key, telemetry, 10, TimeUnit.MINUTES);
            refreshCachedDeviceAqiAndTimestamp(deviceId, telemetry);
        }
    }

    /**
     * Get the Telemetry object from Redis safely
     */
    public Telemetry getCachedTelemetry(String deviceId) {
        Object cached = redisTemplate.opsForValue().get(TELEMETRY_KEY_PREFIX + deviceId);
        if (cached == null) return null;

        // Convert LinkedHashMap to Telemetry safely
        return objectMapper.convertValue(cached, Telemetry.class);
    }

    public void refreshCachedDeviceAqiAndTimestamp(String deviceId, Telemetry telemetry) {
        if (telemetry == null) return;

        DeviceDTO cachedDevice = getCachedDevice(deviceId);
        if (cachedDevice != null) {
            // Only update the changing fields
            cachedDevice.setOverallAqi(telemetry.getOverallAqi());
            cachedDevice.setLastUpdatedDate(
                    telemetry.getTimestamp() != null ? telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")) : "N/A"
            );

            // Write updated object back to cache
            cacheDevice(cachedDevice);
        }
    }

}
