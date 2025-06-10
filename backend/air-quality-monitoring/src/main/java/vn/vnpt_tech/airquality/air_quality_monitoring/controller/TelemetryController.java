package vn.vnpt_tech.airquality.air_quality_monitoring.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.TelemetryDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.TelemetryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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
     * Get Raw Pollutant data based on the DeviceId
     */
    @GetMapping("/all-data/{deviceId}")
    public ResponseEntity<Map<String, Object>> getLatestRawDataForDevice(@PathVariable String deviceId) {
        Optional<Telemetry> telemetryOpt = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId);

        if (telemetryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Telemetry telemetry = telemetryOpt.get();

        // Prepare the raw data and AQI information
        Map<String, Object> rawData = new HashMap<>();
        rawData.put("pm25", telemetry.getPm25());
        rawData.put("pm10", telemetry.getPm10());
        rawData.put("co", telemetry.getCo());
        rawData.put("so2", telemetry.getSo2());
        rawData.put("no2", telemetry.getNo2());
        rawData.put("o3", telemetry.getO3());
        rawData.put("aqiPm25", telemetry.getAqiPm25());
        rawData.put("aqiPm10", telemetry.getAqiPm10());
        rawData.put("aqiCo", telemetry.getAqiCo());
        rawData.put("aqiSo2", telemetry.getAqiSo2());
        rawData.put("aqiNo2", telemetry.getAqiNo2());
        rawData.put("aqiO3", telemetry.getAqiO3());
        rawData.put("overallAqi", telemetry.getOverallAqi());

        return ResponseEntity.ok(rawData);
    }

    /**
     * Fetch all pollutant data for a device on a specific day
     * @param deviceId
     * @param date The date for the historical data (in format dd-MM-yyyy)
     * @return All data for the device on that specific day
     */

    @GetMapping("/historical-all/{deviceId}")
    public ResponseEntity<List<TelemetryDTO>> getAllDataForDay(
            @PathVariable String deviceId,
            @RequestParam String date // Format: dd-MM-yyyy
    ) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy");
            LocalDate queryDate = LocalDate.parse(date, formatter);
            List<Telemetry> data = telemetryRepository.findByDeviceId(deviceId);

            // Filter the data based on the date part of the timestamp
            List<Telemetry> filteredData = data.stream()
                    .filter(t -> t.getTimestamp().toLocalDate().equals(queryDate))
                    .collect(Collectors.toList());

            if (filteredData.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            // Convert filtered data to DTOs and format the timestamp
            List<TelemetryDTO> telemetryDTOs = filteredData.stream()
                    .map(telemetry -> {
                        // Format timestamp
                        String formattedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
                        // Return a DTO with the formatted timestamp
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getOverallAqi());
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(telemetryDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Fetch pollutant data for a device over a time range
     * @param deviceId The device for which we want to fetch the data
     * @param startDate The start date for the range (in format dd-MM-yyyy)
     * @param endDate The end date for the range (in format dd-MM-yyyy)
     * @return List of Telemetry data for the device over the given time range
     */

    @GetMapping("/historical-range/{deviceId}")
    public ResponseEntity<List<TelemetryDTO>> getPollutantDataForTimeRange(
            @PathVariable String deviceId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);

            List<Telemetry> data = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId, start.atStartOfDay(), end.atTime(23, 59, 59));

            if (data.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<TelemetryDTO> telemetryDTOs = data.stream()
                    .map(telemetry -> {
                        // Format timestamp
                        String formattedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        // Return a DTO with the formatted timestamp and pollutant data
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getOverallAqi());
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(telemetryDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Get the polluted time percentage for a specific device and date
     */
    @GetMapping("/polluted-time-percentage/{deviceId}")
    public ResponseEntity<Double> getPollutedTimePercentage(
            @PathVariable String deviceId,
            @RequestParam String date, // Date in the format dd-MM-yyyy
            @AuthenticationPrincipal Users user) {

        try {
            // Parse the date from the query parameter
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate queryDate = LocalDate.parse(date, formatter);

            int aqiThreshold = user.getAqiThreshold();
            List<Telemetry> telemetryData = telemetryRepository.findByDeviceIdAndDate(deviceId, queryDate);
            
            if (telemetryData.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            double pollutedTimePercentage = telemetryService.calculatePollutedTimePercentage(deviceId, queryDate, aqiThreshold);

            return ResponseEntity.ok(pollutedTimePercentage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Compare pollutant data between two stations over a time range
     * @param deviceId1 The first device (station)
     * @param deviceId2 The second device (station)
     * @param startDate The start date for the range (in format dd-MM-yyyy)
     * @param endDate The end date for the range (in format dd-MM-yyyy)
     * @return Comparison of pollutant data between the two stations over the given time range
     */
    @GetMapping("/compare/{deviceId1}/{deviceId2}")
    public ResponseEntity<Map<String, List<TelemetryDTO>>> comparePollutantsBetweenStations(
            @PathVariable String deviceId1,
            @PathVariable String deviceId2,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            // Parse start and end dates
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);

            // Query data for both stations
            List<Telemetry> data1 = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId1, start.atStartOfDay(), end.atTime(23, 59, 59));
            List<Telemetry> data2 = telemetryRepository.findByDeviceIdAndTimestampBetween(deviceId2, start.atStartOfDay(), end.atTime(23, 59, 59));

            // If either station has no data, return no content
            if (data1.isEmpty() || data2.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            // Convert both sets of data into DTOs
            List<TelemetryDTO> telemetryDTOs1 = data1.stream()
                    .map(telemetry -> {
                        String formattedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getOverallAqi());
                    })
                    .collect(Collectors.toList());

            List<TelemetryDTO> telemetryDTOs2 = data2.stream()
                    .map(telemetry -> {
                        String formattedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getOverallAqi());
                    })
                    .collect(Collectors.toList());

            Map<String, List<TelemetryDTO>> comparisonResult = new HashMap<>();
            comparisonResult.put(deviceId1, telemetryDTOs1);
            comparisonResult.put(deviceId2, telemetryDTOs2);

            return ResponseEntity.ok(comparisonResult);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}
