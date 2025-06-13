package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.DeviceService;

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

    @Autowired
    private DeviceService deviceService;

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

    /**
     * Endpoint to return All Device Information for Map Marker Set up
     */
    @GetMapping("/location-aqi")
    public ResponseEntity<List<DeviceDTO>> getAllDeviceWithAqi() {
        List<Device> devices = deviceService.getAllDevices();
        List<DeviceDTO> deviceDTOs = new ArrayList<>();

        for (Device device : devices) {
            Optional<Telemetry> telemetryOpt = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(device.getDeviceId());
            if (telemetryOpt.isPresent()) {
                Telemetry telemetry = telemetryOpt.get();
                deviceDTOs.add(new DeviceDTO(device, telemetry));
            }
        }

        return ResponseEntity.ok(deviceDTOs);
    }

    /**
     * Method to find the nearest Station/ Device according to the user current location
     * @param user In order to get the user current location
     * @return Nearest Station with its telemetry data
     */
    @GetMapping("/nearest-station")
    public ResponseEntity<DeviceDTO> getNearestStation(@AuthenticationPrincipal Users user) {
        List<Device> devices = deviceRepository.findAll();
        Device nearestDevice = null;
        double minDistance = Double.MAX_VALUE;

        for(Device device : devices) {
            double distance = calculateDistance(user.getLatitude(), user.getLongitude(), device.getLatitude(), device.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearestDevice = device;
            }
        }

        if (nearestDevice == null) {
            return ResponseEntity.notFound().build();
        }

        Telemetry latestTelemetry = telemetryRepository
                .findTopByDeviceIdOrderByTimestampDesc(nearestDevice.getDeviceId())
                .orElse(null);

        // Return the nearest device along with its telemetry data in DTO format
        DeviceDTO deviceDTO = new DeviceDTO(nearestDevice, latestTelemetry);
        return ResponseEntity.ok(deviceDTO);
    }

    /**
     * Haversine formula to calculate the distance between two points on the Earth's surface
     * @param lat1 Latitude of the first point
     * @param lon1 Longitude of the first point
     * @param lat2 Latitude of the second point
     * @param lon2 Longitude of the second point
     * @return The distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Radius of the Earth in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

}
