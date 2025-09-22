package vn.vnpt_tech.airquality.air_quality_monitoring.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.TelemetryDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.UserPreferences;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.helper.AqiCalculator;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserPreferencesRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.TelemetryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final Logger teleLogger = LoggerFactory.getLogger(TelemetryController.class);

    @Autowired
    private TelemetryRepository telemetryRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Autowired
    private DeviceRepository deviceRepository;

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
            @AuthenticationPrincipal Users user // This injects the logged-in user
    ) {
        List<Device> devices = deviceRepository.findAll();

        List<Telemetry> dummyList = new ArrayList<>();
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        int[] days = {2, 3, 4};
        long intervalsPerDay = 24 * 60 / 15;

        for (Device device : devices) {
            // For each device, simulate telemetry data for the previous 2, 3, and 4 days
            for (int daysAgo : days) {
                // Calculate the start of the day (for each of the 2, 3, or 4 days ago)
                LocalDateTime dayStart = now.minus(daysAgo, ChronoUnit.DAYS).toLocalDate().atStartOfDay();

                // Generate telemetry data for each 15-minute interval within the day
                for (int j = 0; j < intervalsPerDay; j++) {
                    // Calculate the timestamp for the current 15-minute interval
                    LocalDateTime timestamp = dayStart.plusMinutes(j * 15);  // 15-minute intervals

                    // Generate telemetry data with the specified ranges for each pollutant
                    Telemetry telemetry = Telemetry.builder()
                            .deviceId(device.getDeviceId()) // Link to device's deviceId
                            .latitude(device.getLatitude()) // Use device's latitude
                            .longitude(device.getLongitude()) // Use device's longitude
                            .pm25(round(random.nextDouble() * (50 - 5) + 5  , 1))
                            .pm10(round(random.nextDouble() * (70 - 10) + 10, 1))
                            .co(round(random.nextDouble() * (2.0 - 0.1) + 0.1, 3))
                            .so2(round(random.nextDouble() * (0.05 - 0.002) + 0.002, 4))
                            .o3(round(random.nextDouble() * (0.08 - 0.01) + 0.01, 3))
                            .no2(round(random.nextDouble() * (0.15 - 0.01) + 0.01, 3))
                            .timestamp(timestamp)
                            .build();

                    telemetryService.applyAqiCalculations(telemetry); // Apply AQI calculations if needed
                    dummyList.add(telemetry);
                }
            }
        }

        // Save the dummy data to the repository
        telemetryRepository.saveAll(dummyList);

        return ResponseEntity.ok("Inserted dummy telemetry records.");
    }

    // Helper method to round numbers to a specific number of decimal places
    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();

        long factor = (long) Math.pow(10, places);
        value = value * factor;
        long tmp = Math.round(value);
        return (double) tmp / factor;
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
//    @GetMapping("/aqi/by-month")
//    public ResponseEntity<List<Telemetry>> getAqiByMonth(
//            @AuthenticationPrincipal Users user,
//            @RequestParam("year") int year,
//            @RequestParam("month") int month
//    ) {
//        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
//        LocalDateTime end = start.plusMonths(1);
//
//        List<Telemetry> telemetrys = telemetryRepository
//                .findByDeviceIdAndTimestampBetween(user.getEmail(), start, end);
//
//        return ResponseEntity.ok(telemetrys);
//    }

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
        rawData.put("pm25", telemetry.getPm25() != null ? telemetry.getPm25() : "N/A");
        rawData.put("pm10", telemetry.getPm10() != null ? telemetry.getPm10() : "N/A");
        rawData.put("co", telemetry.getCo() != null ? telemetry.getCo() : "N/A");
        rawData.put("so2", telemetry.getSo2() != null ? telemetry.getSo2() : "N/A");
        rawData.put("no2", telemetry.getNo2() != null ? telemetry.getNo2() : "N/A");
        rawData.put("o3", telemetry.getO3() != null ? telemetry.getO3() : "N/A");
        rawData.put("temperature", telemetry.getTemperature() != null ? telemetry.getTemperature() : "N/A");
        rawData.put("pressure", telemetry.getPressure() != null ? telemetry.getPressure() : "N/A");
        rawData.put("humidity", telemetry.getHumidity() != null ? telemetry.getHumidity() : "N/A");
        rawData.put("aqiPm25", telemetry.getAqiPm25() != null ? telemetry.getAqiPm25() : "N/A");
        rawData.put("aqiPm10", telemetry.getAqiPm10() != null ? telemetry.getAqiPm10() : "N/A");
        rawData.put("aqiCo", telemetry.getAqiCo() != null ? telemetry.getAqiCo() : "N/A");
        rawData.put("aqiSo2", telemetry.getAqiSo2() != null ? telemetry.getAqiSo2() : "N/A");
        rawData.put("aqiNo2", telemetry.getAqiNo2() != null ? telemetry.getAqiNo2() : "N/A");
        rawData.put("aqiO3", telemetry.getAqiO3() != null ? telemetry.getAqiO3() : "N/A");
        rawData.put("overallAqi", telemetry.getOverallAqi() != null ? telemetry.getOverallAqi() : "N/A");

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
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getTemperature(), telemetry.getHumidity(), telemetry.getPressure(), telemetry.getOverallAqi());
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
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getTemperature(), telemetry.getHumidity(), telemetry.getPressure(), telemetry.getOverallAqi());
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
            @RequestParam String date,
            @AuthenticationPrincipal Users user) {

        try {
            // Parse the date from the query parameter
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate queryDate = LocalDate.parse(date, formatter);

            UserPreferences userPreferences = userPreferencesRepository.findByUsers(user)
                    .orElseThrow(() -> new RuntimeException("User preferences not found"));

            int aqiThreshold = userPreferences.getAqiThreshold();
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
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getTemperature(), telemetry.getHumidity(), telemetry.getPressure(), telemetry.getOverallAqi());
                    })
                    .collect(Collectors.toList());

            List<TelemetryDTO> telemetryDTOs2 = data2.stream()
                    .map(telemetry -> {
                        String formattedDate = telemetry.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        return new TelemetryDTO(telemetry.getDeviceId(), formattedDate, telemetry.getPm25(), telemetry.getPm10(), telemetry.getCo(), telemetry.getSo2(), telemetry.getNo2(), telemetry.getO3(), telemetry.getTemperature(), telemetry.getHumidity(), telemetry.getPressure(), telemetry.getOverallAqi());
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

    /**
     * API endpoint to get average AQI and pollutants for a device on a specific date.
     *
     * @param deviceId The ID of the device.
     * @param date The date for which to calculate averages.
     * @return Map of average AQI and pollutant values.
     */
    @GetMapping("/average/{deviceId}")
    public Map<String, Double> getAverageTelemetry(@PathVariable String deviceId, @RequestParam("date") String date) {
        LocalDate localDate = LocalDate.parse(date);
        return telemetryService.calculateAverageAqiAndPollutants(deviceId, localDate);
    }

    /**
     * API endpoint to generate custom report data.
     *
     * @param deviceIds Comma-separated list of device IDs.
     * @param pollutants Comma-separated list of pollutants.
     * @param startDate The start date.
     * @param endDate The end date.
     * @return A map containing chart data and statistics.
     */
    @GetMapping("/report")
    public ResponseEntity<?> getReportData(
            @RequestParam("deviceIds") List<String> deviceIds,
            @RequestParam("pollutants") List<String> pollutants,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            Map<String, Object> reportData = telemetryService.generateReportData(deviceIds, pollutants, start, end);

            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error generating report: " + e.getMessage());
        }
    }
}
