package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD class for Device
 */
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @PostMapping
    public ResponseEntity<Device> createDevice(@RequestBody Device device){
        if (deviceRepository.existsById(device.getDeviceId())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(deviceRepository.save(device));
    }

    /**
     *  Register Multiple Devices
     */
    @PostMapping("/batch-register")
    public ResponseEntity<List<Device>> registerMultipleDevices(@RequestBody List<Device> devices) {
        List<Device> saved = deviceRepository.saveAll(devices);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<Device> getDevice(@PathVariable String deviceId) {
        return deviceRepository.findById(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{deviceId}")
    public ResponseEntity<Device> updateDevice(@PathVariable String deviceId, @RequestBody Device updatedDevice) {
        return deviceRepository.findById(deviceId)
                .map(existing -> {
                    existing.setDeviceName(updatedDevice.getDeviceName());
                    existing.setAccessToken(updatedDevice.getAccessToken());
                    existing.setLatitude(updatedDevice.getLatitude());
                    existing.setLongitude(updatedDevice.getLongitude());
                    return ResponseEntity.ok(deviceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> deleteDevice(@PathVariable String deviceId) {
        if (!deviceRepository.existsById(deviceId)) {
            return ResponseEntity.notFound().build();
        }
        deviceRepository.deleteById(deviceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<Device> listAllDevices() {
        return deviceRepository.findAll();
    }

    /**
     * Return selected devices with latest telemetry in DTO format for FE
     */
    @GetMapping("/{deviceId}/with-latest-telemetry")
    public ResponseEntity<DeviceDTO> getDevicesWithLatestTelemetry(@PathVariable String deviceId) {
        Optional<Device> deviceOpt = deviceRepository.findByDeviceId(deviceId);
        if (deviceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Device device = deviceOpt.get();
        Telemetry telemetry = telemetryRepository
                .findTopByDeviceIdOrderByTimestampDesc(deviceId)
                .orElse(null);

        return ResponseEntity.ok(new DeviceDTO(device, telemetry));

    }

}
