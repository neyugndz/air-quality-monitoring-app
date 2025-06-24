package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.ForecastRequest;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.ForecastService;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SseController {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private ForecastService forecastService;

    @GetMapping(value = "/alerts", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public void streamAlerts(@RequestHeader("Authorization") String authorizationHeader,
                             @AuthenticationPrincipal Users users, HttpServletResponse response) throws IOException {
        response.setContentType("text/event-stream");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        OutputStream out = response.getOutputStream();

        String token = authorizationHeader.replace("Bearer ", "");

        if (token == null) {
            out.write("data: {\"error\": \"Invalid token.\"}\n\n".getBytes(StandardCharsets.UTF_8));
            out.flush();
            return;
        }

        DeviceDTO nearestDevice = getNearestStation(users);
        if(nearestDevice == null) {
            out.write("data: No nearby station found.\n\n".getBytes(StandardCharsets.UTF_8));
            out.flush();
            return;
        }

        String deviceId = nearestDevice.getDeviceId();

        // Prepare the forecast request based on the nearest device
        String startTime = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"));
        int horizon = 24;

        ForecastRequest forecastRequest = new ForecastRequest();
        forecastRequest.setDeviceId(deviceId);
        forecastRequest.setStartTime(startTime);
        forecastRequest.setHorizon(horizon);

        // Get the forecast data
        List<Double> forecast = forecastService.getForecast(forecastRequest);

        // Stream the forecast values as part of the message
        String forecastMessage = "{\"forecast\": " + forecast.toString() + "}";
        // Send the data as valid SSE message
        out.write((forecastMessage).getBytes(StandardCharsets.UTF_8));
        out.flush();
    }

    private DeviceDTO getNearestStation(Users user) {
        List<Device> devices = deviceRepository.findAll();
        Device nearestDevice = null;
        double minDistance = Double.MAX_VALUE;

        // Find the nearest device based on distance
        for (Device device : devices) {
            double distance = calculateDistance(user.getLatitude(), user.getLongitude(), device.getLatitude(), device.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearestDevice = device;
            }
        }

        // If no nearest device is found, return null
        if (nearestDevice == null) {
            return null;
        }

        // Fetch the latest telemetry data for the nearest device
        Telemetry latestTelemetry = telemetryRepository
                .findTopByDeviceIdOrderByTimestampDesc(nearestDevice.getDeviceId())
                .orElse(null);

        // Return the nearest device with the latest telemetry in DTO format
        return new DeviceDTO(nearestDevice, latestTelemetry);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Radius of the Earth in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Returns the distance in kilometers
    }
}
