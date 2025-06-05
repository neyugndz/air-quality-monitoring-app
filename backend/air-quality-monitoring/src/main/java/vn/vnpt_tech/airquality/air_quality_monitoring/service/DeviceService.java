package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TelemetryRepository telemetryRepository;


    /**
     * Retrieves device details along with the latest telemetry and constructs a DeviceDTO.
     *
     * @param deviceId The device ID to look up.
     * @return A DeviceDTO containing the device details and overall AQI.
     */
    public DeviceDTO getDeviceDetails(String deviceId) {
        // Fetch the device by ID
        Device device = deviceRepository.findById(deviceId).orElseThrow(() -> new RuntimeException("Device not found"));

        // Fetch the latest telemetry data for the device
        Optional<Telemetry> telemetryOpt = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId);

        Telemetry telemetry = telemetryOpt.get();

        // Return the constructed DTO containing device and telemetry info
        return new DeviceDTO(device, telemetry);
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }
}
