package vn.vnpt_tech.airquality.air_quality_monitoring.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.SensorReading;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.SensorReadingRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/sensor")
public class SensorReadingController {
    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    /**
     * Upload a real reading (requires valid JWT token)
     */
    @PostMapping("/upload")
    public ResponseEntity<Void> upload(@RequestBody SensorReading reading,
                                       @AuthenticationPrincipal Users user) {
        reading.setTimestamp(LocalDateTime.now());
        reading.setDeviceId(user.getEmail()); // TODO: link to user device
        applyAqiCalculations(reading);

        sensorReadingRepository.save(reading);
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
        List<SensorReading> dummyList = new ArrayList<>();
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < count; i++) {
            SensorReading reading = SensorReading.builder()
                    .deviceId(user.getEmail()) // link fake data to user account
                    .latitude(21.0285 + random.nextDouble() * 0.01)
                    .longitude(105.8542 + random.nextDouble() * 0.01)
                    .temperature(25 + random.nextDouble() * 10)
                    .humidity(40 + random.nextDouble() * 30)
                    .pressure(1000.0 + random.nextDouble() * 50)
                    .pm25(random.nextDouble() * 400)
                    .pm10(random.nextDouble() * 500)
                    .co(random.nextDouble() * 10)
                    .so2(random.nextDouble() * 1)
                    .no2(random.nextDouble() * 1)
                    .o3(random.nextDouble() * 1)
                    .timestamp(now.minusMinutes(count - i))
                    .build();

            applyAqiCalculations(reading); // TODO: Calculate and set AQI values (removal, support testing)
            dummyList.add(reading);
        }

        sensorReadingRepository.saveAll(dummyList);
        return ResponseEntity.ok("Inserted " + count + " dummy readings.");
    }

    /**
     * Get all sensor readings (optional: make public)
     */
    @GetMapping("/all")
    public ResponseEntity<List<SensorReading>> getAll() {
        return ResponseEntity.ok(sensorReadingRepository.findAll());
    }

    /**
     * Utility method to calculate the AQI
     */
    private void applyAqiCalculations(SensorReading reading) {
        int aqiPm25 = AqiCalculator.aqiPm25(reading.getPm25());
        int aqiPm10 = AqiCalculator.aqiPm10(reading.getPm10());
        int aqiCo   = AqiCalculator.aqiCo(reading.getCo());
        int aqiSo2  = AqiCalculator.aqiSo2(reading.getSo2());
        int aqiNo2  = AqiCalculator.aqiNo2(reading.getNo2());
        int aqiO3   = AqiCalculator.aqiO3(reading.getO3());

        reading.setAqiPm25(aqiPm25);
        reading.setAqiPm10(aqiPm10);
        reading.setAqiCo(aqiCo);
        reading.setAqiSo2(aqiSo2);
        reading.setAqiNo2(aqiNo2);
        reading.setAqiO3(aqiO3);

        int overall = Collections.max(List.of(aqiPm25, aqiPm10, aqiCo, aqiSo2, aqiNo2, aqiO3));
        reading.setOverallAqi(overall);
    }

    /**
     * Get latest aqi data based on the day
     * */
    @GetMapping("/aqi/latest")
    public ResponseEntity<SensorReading> getLatestAqi(@AuthenticationPrincipal Users user) {
        return sensorReadingRepository.findTopByDeviceIdOrderByTimestampDesc(user.getEmail())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // TODO: Add controller to get AQI based on months
    /**
     * Get latest aqi data based on selected day (calculate by the LocalDateTime by subtract the end and the beginning)
     * */
    @GetMapping("/aqi/by-month")
    public ResponseEntity<List<SensorReading>> getAqiByMonth(
            @AuthenticationPrincipal Users user,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        List<SensorReading> readings = sensorReadingRepository
                .findByDeviceIdAndTimestampBetween(user.getEmail(), start, end);

        return ResponseEntity.ok(readings);
    }

    /**
     * Get latest raw data based on the day
     */
    @GetMapping("/raw/latest")
    public ResponseEntity<Map<String, Object>> getRawOnly(@AuthenticationPrincipal Users user) {
        return sensorReadingRepository.findTopByDeviceIdOrderByTimestampDesc(user.getEmail())
                .map(r -> {
                    Map<String, Object> raw = new HashMap<>();
                    raw.put("temperature", r.getTemperature());
                    raw.put("humidity", r.getHumidity());
                    raw.put("pressure", r.getPressure());
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
