package vn.vnpt_tech.airquality.air_quality_monitoring.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.TelemetryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/telemetry")
public class TelemetryController {
    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private TelemetryService telemetryService;

    /**
     * Upload a real reading (requires valid JWT token)
     */
    @PostMapping("/upload")
    public ResponseEntity<Void> upload(@RequestBody Telemetry telemetry,
                                       @AuthenticationPrincipal Users user) {
        telemetry.setTimestamp(LocalDateTime.now());
        telemetry.setDeviceId(user.getEmail()); // TODO: link to user device
        telemetryService.applyAqiCalculations(telemetry);

        telemetryRepository.save(telemetry);
        return ResponseEntity.ok().build();
    }

    /**
     * Generate dummy readings
     */
    @PostMapping("/generate")
    public ResponseEntity<String> generateDummyData(
            @RequestParam(defaultValue = "100") int count,
            @AuthenticationPrincipal Users user // This injects the logged-in user
    ) {
        List<Telemetry> dummyList = new ArrayList<>();
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < count; i++) {
            Telemetry telemetry = Telemetry.builder()
                    .deviceId(user.getEmail()) // link fake data to user account
                    .latitude(21.0285 + random.nextDouble() * 0.01)
                    .longitude(105.8542 + random.nextDouble() * 0.01)
                    .pm25(random.nextDouble() * 400)
                    .pm10(random.nextDouble() * 500)
                    .co(random.nextDouble() * 10)
                    .so2(random.nextDouble() * 1)
                    .no2(random.nextDouble() * 1)
                    .o3(random.nextDouble() * 1)
                    .timestamp(now.minusMinutes(count - i))
                    .build();

            telemetryService.applyAqiCalculations(telemetry); // TODO: Calculate and set AQI values (removal, support testing)
            dummyList.add(telemetry);
        }

        telemetryRepository.saveAll(dummyList);
        return ResponseEntity.ok("Inserted " + count + " dummy telemetrys.");
    }

    /**
     * Get all sensor readings (optional: make public)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Telemetry>> getAll() {
        return ResponseEntity.ok(telemetryRepository.findAll());
    }

    /**
     * Get latest aqi data based on the day
     * */
    @GetMapping("/aqi/latest")
    public ResponseEntity<Telemetry> getLatestAqi(@AuthenticationPrincipal Users user) {
        return telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(user.getEmail())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetch latest aqi data from the platform
     * */
    @GetMapping("/fetch-latest/{deviceId}")
    public ResponseEntity<Void> fetchLatestOneIotData(
            @PathVariable String deviceId) {

        telemetryService.fetchAndStoreLatestFromOneIoT(deviceId);
        return ResponseEntity.ok().build();
    }


    // TODO: Add controller to get AQI based on months
    /**
     * Get latest aqi data based on selected day (calculate by the LocalDateTime by subtract the end and the beginning)
     * */
    @GetMapping("/aqi/by-month")
    public ResponseEntity<List<Telemetry>> getAqiByMonth(
            @AuthenticationPrincipal Users user,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        List<Telemetry> telemetrys = telemetryRepository
                .findByDeviceIdAndTimestampBetween(user.getEmail(), start, end);

        return ResponseEntity.ok(telemetrys);
    }

    /**
     * Get latest raw data based on the day
     */
    @GetMapping("/raw/latest")
    public ResponseEntity<Map<String, Object>> getRawOnly(@AuthenticationPrincipal Users user) {
        return telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(user.getEmail())
                .map(r -> {
                    Map<String, Object> raw = new HashMap<>();
                    raw.put("pm25", r.getPm25());
                    raw.put("pm10", r.getPm10());
                    raw.put("co", r.getCo());
                    raw.put("so2", r.getSo2());
                    raw.put("no2", r.getNo2());
                    raw.put("o3", r.getO3());
                    raw.put("timestamp", r.getTimestamp());
                    return ResponseEntity.ok(raw);
                }).orElse(ResponseEntity.notFound().build());
    }

    // TODO: Add the controller to get AQI and raw data by selected day

    // TODO: Add controller to get AQI based on custom range
}
