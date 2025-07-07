package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.CacheService;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.TelemetryService;

import javax.swing.text.html.Option;
import java.util.Optional;

@RestController
@RequestMapping("/api/cache")
public class CacheController {

    @Autowired
    private CacheService cacheService;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private TelemetryService telemetryService;

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<DeviceDTO> getDevice(@PathVariable String deviceId) {
        // Check if there any Cached DTO
        DeviceDTO cachedDevice = cacheService.getCachedDevice(deviceId);
        if (cachedDevice != null) {
            return ResponseEntity.ok(cachedDevice);
        }

        Telemetry telemetry = cacheService.getCachedTelemetry(deviceId);
        if (telemetry == null) {
            telemetry = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId).orElse(null);
            if (telemetry != null) {
                telemetryService.applyAqiCalculations(telemetry);
                cacheService.cacheTelemetry(telemetry, deviceId);
            }
        } else {
            if (telemetry.getOverallAqi() == null) {
                telemetryService.applyAqiCalculations(telemetry);
                cacheService.cacheTelemetry(telemetry, deviceId);
            }
        }

        // Build a fresh DTO from the cached Device and Telemetry
        Optional<Device> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isPresent()) {
            DeviceDTO dto = new DeviceDTO(deviceOpt.get(), telemetry);
            cacheService.cacheDevice(dto);
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/telemetry/{deviceId}")
    public ResponseEntity<Telemetry> getTelemetry(@PathVariable String deviceId) {
        Telemetry cached = cacheService.getCachedTelemetry(deviceId);
        if (cached != null) {
            return ResponseEntity.ok(cached);
        }

        Optional<Telemetry> dbTelemetry = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId);
        if (dbTelemetry.isPresent()) {
            cacheService.cacheTelemetry(dbTelemetry.get(), deviceId);
            return ResponseEntity.ok(dbTelemetry.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private DeviceDTO mapToDto(Device device) {
        DeviceDTO dto = new DeviceDTO();
        dto.setDeviceId(device.getDeviceId());
        dto.setStationName(device.getStationName());
        dto.setLatitude(device.getLatitude());
        dto.setLongitude(device.getLongitude());
        return dto;
    }
}
