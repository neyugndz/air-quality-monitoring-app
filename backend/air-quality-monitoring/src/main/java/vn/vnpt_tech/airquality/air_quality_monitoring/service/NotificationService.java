package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.dto.DeviceDTO;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Device;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.DeviceRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.TelemetryRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private TelemetryService telemetryService;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TelemetryRepository telemetryRepository;

    public void sendSummary(Users user, String summaryType) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String formattedDate = LocalDate.now().minusDays(1).format(formatter);

        LocalDate startOfWeek = LocalDate.now().minusDays(7);
        String weekRange = startOfWeek.format(formatter) + " - " + formattedDate;

        String subject = "Air Quality " + summaryType + " for " + (summaryType.equals("Weekly Summary") ? weekRange : formattedDate);

        // Generate the body based on the summary type
        String body = "";
        if (summaryType.equals("Daily Summary")) {
            body = generateDailySummaryBody(user);
        } else if (summaryType.equals("Weekly Summary")) {
            body = generateWeeklySummaryBody(user);
        } else {
            // If the summary type is invalid, return early or log an error
            throw new IllegalArgumentException("Invalid summary type: " + summaryType);
        }

        // Send the email
        emailService.send(user.getEmail(), subject, body);
    }

    /**
     * Generates the summary body based on average AQI and pollutant levels.
     * @param user the user for whom the summary is generated
     * @return the generated summary body
     */
    private String generateDailySummaryBody(Users user) {

        DeviceDTO nearestDevice = getNearestStation(user);
        // Get the average AQI and pollutants from the telemetry service
        Map<String, Double> averages = telemetryService.calculateAverageAqiAndPollutants(nearestDevice.getDeviceId(), LocalDate.now().minusDays(1)); // For yesterday

        double averageAqi = averages.get("averageAqi");
        long roundedAqi = Math.round(averageAqi);
        String aqiCategory = getAqiCategory(averageAqi);
        String aqiAdvice = getAqiAdvice(aqiCategory);

        StringBuilder summary = new StringBuilder();
        summary.append("The average AQI for yesterday was ").append(roundedAqi).append(", which falls under the ").append(aqiCategory).append(" category.\n");
        summary.append(aqiAdvice).append("\n\n");

        // Compare pollutants with recommended values
        comparePollutantLevels(averages, summary);

        String mostImpactfulPollutant = getMostImpactfulPollutant(averages);
        summary.append("\nThe pollutant with the most impact on the AQI was: ").append(mostImpactfulPollutant).append("\n");

        // Generate health advice based on the most impactful pollutant
        String healthAdviceForPollutant = getHealthAdviceForPollutant(mostImpactfulPollutant);
        summary.append(healthAdviceForPollutant).append("\n");

        // Add daily health alerts based on pollutant levels
        summary.append("\nHealth Alerts for the Day:\n");
        String dailyHealthAlerts = generateDailyHealthAlerts(averages);
        summary.append(dailyHealthAlerts).append("\n");

        summary.append("You are currently subscribed to daily pollution alerts and will be notified when the AQI exceeds ").append(user.getUserPreferences().getFirst().getAqiThreshold());
        return summary.toString();
    }

    public DeviceDTO getNearestStation(Users user) {
        List<Device> devices = deviceRepository.findAll();
        Device nearestDevice = null;
        double minDistance = Double.MAX_VALUE;

        for (Device device : devices) {
            double distance = calculateDistance(user.getLatitude(), user.getLongitude(), device.getLatitude(), device.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearestDevice = device;
            }
        }

        if (nearestDevice == null) {
            return null; // Return null if no nearest device is found
        }

        Telemetry latestTelemetry = telemetryRepository
                .findTopByDeviceIdOrderByTimestampDesc(nearestDevice.getDeviceId())
                .orElse(null);

        // Return the nearest device along with its telemetry data in DTO format
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
        return R * c; // Return distance in kilometers
    }

    /**
     * Get the AQI category based on the average AQI value
     * @param averageAqi the average AQI value
     * @return the AQI category
     */
    private String getAqiCategory(double averageAqi) {
        if (averageAqi <= 50) return "Good";
        if (averageAqi <= 100) return "Moderate";
        if (averageAqi <= 150) return "Poor";
        if (averageAqi <= 200) return "Bad";
        if (averageAqi <= 300) return "Dangerous";
        return "Hazardous";
    }

    /**
     * Get the health advice based on AQI category
     * @param category the AQI category
     * @return the health advice string
     */
    private String getAqiAdvice(String category) {
        switch (category) {
            case "Good":
                return "It’s safe for everyone to enjoy outdoor activities.";
            case "Moderate":
                return "It’s generally safe for most people, but those with respiratory conditions should take precautions.";
            case "Poor":
                return "People with respiratory conditions, children, and the elderly should limit prolonged outdoor activities.";
            case "Bad":
                return "Everyone may experience some adverse health effects. People with respiratory conditions should avoid outdoor activities.";
            case "Dangerous":
                return "Health alert: everyone may experience significant health effects. Limit outdoor activities.";
            case "Hazardous":
                return "Health warning of emergency conditions. Everyone should avoid outdoor activities.";
            default:
                return "No advice available.";
        }
    }

    /**
     * Compare pollutant levels with recommended values and generate comparison message
     * @param averages the average pollutant levels
     * @param summary the string builder to append the messages
     */
    private void comparePollutantLevels(Map<String, Double> averages, StringBuilder summary) {
        // Define recommended values (updated units and values)
        double recommendedPm25 = 25.0; // µg/m³
        double recommendedPm10 = 50.0; // µg/m³
        double recommendedCo = 9.0; // ppm
        double recommendedNo2 = 0.040; // ppm
        double recommendedSo2 = 0.75; // ppm
        double recommendedO3 = 0.070; // ppm

        // PM2.5
        double pm25 = averages.get("averagePm25");
        if (pm25 > recommendedPm25) {
            summary.append(String.format("PM2.5 levels were %.1f µg/m³, slightly above the recommended %.1f µg/m³.\n", pm25, recommendedPm25));
        } else {
            summary.append(String.format("PM2.5 levels were %.1f µg/m³, within the recommended limit of %.1f µg/m³.\n", pm25, recommendedPm25));
        }

        // PM10
        double pm10 = averages.get("averagePm10");
        if (pm10 > recommendedPm10) {
            summary.append(String.format("PM10 levels were %.1f µg/m³, slightly above the recommended %.1f µg/m³.\n", pm10, recommendedPm10));
        } else {
            summary.append(String.format("PM10 levels were %.1f µg/m³, within the recommended limit of %.1f µg/m³.\n", pm10, recommendedPm10));
        }

        // CO
        double co = averages.get("averageCo");
        if (co > recommendedCo) {
            summary.append(String.format("CO levels were %.1f ppm, above the recommended %.1f ppm.\n", co, recommendedCo));
        } else {
            summary.append(String.format("CO levels were %.1f ppm, within the recommended limit of %.1f ppm.\n", co, recommendedCo));
        }

        // NO2 (corrected unit: ppm)
        double no2 = averages.get("averageNo2");
        if (no2 > recommendedNo2) {
            summary.append(String.format("NO2 levels were %.3f ppm, above the recommended %.3f ppm.\n", no2, recommendedNo2));
        } else {
            summary.append(String.format("NO2 levels were %.3f ppm, within the recommended limit of %.3f ppm.\n", no2, recommendedNo2));
        }

        // SO2
        double so2 = averages.get("averageSo2");
        if (so2 > recommendedSo2) {
            summary.append(String.format("SO2 levels were %.1f ppm, above the recommended %.1f ppm.\n", so2, recommendedSo2));
        } else {
            summary.append(String.format("SO2 levels were %.1f ppm, within the recommended limit of %.1f ppm.\n", so2, recommendedSo2));
        }

        // O3
        double o3 = averages.get("averageO3");
        if (o3 > recommendedO3) {
            summary.append(String.format("O3 levels were %.1f ppm, above the recommended %.1f ppm.\n", o3, recommendedO3));
        } else {
            summary.append(String.format("O3 levels were %.1f ppm, within the recommended limit of %.1f ppm.\n", o3, recommendedO3));
        }
    }

    private String getMostImpactfulPollutant(Map<String, Double> averages) {
        double recommendedPm25 = 25.0; // µg/m³
        double recommendedPm10 = 50.0; // µg/m³
        double recommendedCo = 9.0; // ppm
        double recommendedNo2 = 0.040; // ppm
        double recommendedSo2 = 0.75; // ppm
        double recommendedO3 = 0.070; // ppm

        // Calculate the difference between actual values and recommended values
        double pm25Diff = Math.abs(averages.get("averagePm25") - recommendedPm25);
        double pm10Diff = Math.abs(averages.get("averagePm10") - recommendedPm10);
        double coDiff = Math.abs(averages.get("averageCo") - recommendedCo);
        double no2Diff = Math.abs(averages.get("averageNo2") - recommendedNo2);
        double so2Diff = Math.abs(averages.get("averageSo2") - recommendedSo2);
        double o3Diff = Math.abs(averages.get("averageO3") - recommendedO3);

        // Find the pollutant with the largest difference (most impact on AQI)
        double maxDiff = Math.max(Math.max(Math.max(pm25Diff, pm10Diff), Math.max(coDiff, no2Diff)), Math.max(so2Diff, o3Diff));

        if (maxDiff == pm25Diff) {
            return "PM2.5";
        } else if (maxDiff == pm10Diff) {
            return "PM10";
        } else if (maxDiff == coDiff) {
            return "CO";
        } else if (maxDiff == no2Diff) {
            return "NO2";
        } else if (maxDiff == so2Diff) {
            return "SO2";
        } else if (maxDiff == o3Diff) {
            return "O3";
        }
        return "No pollutant data available";
    }

    private String getHealthAdviceForPollutant(String pollutant) {
        switch (pollutant) {
            case "PM2.5":
                return "PM2.5 levels are harmful to respiratory health. People with respiratory conditions, children, and the elderly should avoid prolonged outdoor activities.";
            case "PM10":
                return "PM10 particles can irritate the lungs. Sensitive groups should limit prolonged exposure to outdoor air.";
            case "CO":
                return "High CO levels may cause dizziness and shortness of breath. Avoid outdoor exposure, especially for individuals with heart conditions.";
            case "NO2":
                return "NO2 can irritate the respiratory system. People with asthma or chronic respiratory diseases should avoid outdoor activities.";
            case "SO2":
                return "SO2 can lead to respiratory issues. Individuals with heart and lung diseases should limit outdoor activity.";
            case "O3":
                return "O3 exposure can aggravate asthma and other respiratory conditions. Limit outdoor activities, particularly strenuous exercises.";
            default:
                return "No health advice available for this pollutant.";
        }
    }

    private String generateDailyHealthAlerts(Map<String, Double> dailyPollutants) {
        StringBuilder healthAlerts = new StringBuilder();

        // Define the recommended values for pollutants
        double recommendedPm25 = 25.0; // µg/m³
        double recommendedPm10 = 50.0; // µg/m³
        double recommendedCo = 9.0; // ppm
        double recommendedNo2 = 0.040; // ppm
        double recommendedSo2 = 0.75; // ppm
        double recommendedO3 = 0.070; // ppm

        // PM2.5
        double pm25 = dailyPollutants.get("averagePm25");
        pm25 = Math.round(pm25 * 100.0) / 100.0; // Round to 2 decimal places
        if (pm25 > recommendedPm25) {
            healthAlerts.append("Warning: PM2.5 levels were high today (average: ").append(pm25)
                    .append(" µg/m³). Sensitive groups should take extra precautions.\n");
        }

        // PM10
        double pm10 = dailyPollutants.get("averagePm10");
        pm10 = Math.round(pm10 * 100.0) / 100.0; // Round to 2 decimal places
        if (pm10 > recommendedPm10) {
            healthAlerts.append("Warning: PM10 levels were high today (average: ").append(pm10)
                    .append(" µg/m³). Sensitive groups should take extra precautions.\n");
        }

        // CO
        double co = dailyPollutants.get("averageCo");
        co = Math.round(co * 100.0) / 100.0; // Round to 2 decimal places
        if (co > recommendedCo) {
            healthAlerts.append("Warning: CO levels were high today (average: ").append(co)
                    .append(" ppm). Individuals with heart conditions should avoid outdoor activities.\n");
        }

        // NO2
        double no2 = dailyPollutants.get("averageNo2");
        no2 = Math.round(no2 * 1000.0) / 1000.0; // Round to 3 decimal places for NO2 (ppm)
        if (no2 > recommendedNo2) {
            healthAlerts.append("Warning: NO2 levels were high today (average: ").append(no2)
                    .append(" ppm). People with asthma or respiratory conditions should limit outdoor activities.\n");
        }

        // SO2
        double so2 = dailyPollutants.get("averageSo2");
        so2 = Math.round(so2 * 1000.0) / 1000.0; // Round to 2 decimal places
        if (so2 > recommendedSo2) {
            healthAlerts.append("Warning: SO2 levels were high today (average: ").append(so2)
                    .append(" ppm). People with respiratory issues should minimize outdoor activities.\n");
        }

        // O3
        double o3 = dailyPollutants.get("averageO3");
        o3 = Math.round(o3 * 1000.0) / 1000.0; // Round to 2 decimal places
        if (o3 > recommendedO3) {
            healthAlerts.append("Warning: O3 levels were high today (average: ").append(o3)
                    .append(" ppm). Sensitive individuals should avoid strenuous outdoor activities.\n");
        }

        // Return the health alerts generated based on the pollutant levels
        return healthAlerts.toString();
    }

    private String generateWeeklySummaryBody(Users user) {
        StringBuilder summary = new StringBuilder();
        DeviceDTO nearestDevice = getNearestStation(user);
        // Get the AQI summary for the last 7 days
        Map<String, Double> weeklyAqiData = telemetryService.calculateWeeklyAqi(nearestDevice.getDeviceId(), LocalDate.now().minusDays(7)); // Calculate for the last 7 days
        double averageWeeklyAqi = weeklyAqiData.get("averageAqi");
        double highestAqi = weeklyAqiData.get("highestAqi");
        double lowestAqi = weeklyAqiData.get("lowestAqi");

        summary.append("The average AQI for the past week was ").append(Math.round(averageWeeklyAqi)).append(".\n");
        summary.append("The highest AQI during the week was ").append(Math.round(highestAqi)).append(", and the lowest AQI was ").append(Math.round(lowestAqi)).append(".\n");

        // AQI Categories for the week
        String highestCategory = getAqiCategory(highestAqi);
        String lowestCategory = getAqiCategory(lowestAqi);
        summary.append("The highest AQI category during the week was ").append(highestCategory).append(" and the lowest was ").append(lowestCategory).append(".\n");

        // Health recommendations for the week
        summary.append("\nHealth recommendations based on weekly AQI trend:\n");
        if (averageWeeklyAqi <= 50) {
            summary.append("The overall AQI trend for the week suggests healthy air quality, safe for all outdoor activities.\n");
        } else if (averageWeeklyAqi <= 100) {
            summary.append("The air quality is generally safe, but those with respiratory conditions should consider limiting prolonged outdoor activities.\n");
        } else {
            summary.append("The air quality was concerning during the week. Sensitive groups should avoid outdoor activities.\n");
        }

        // Pollutant Breakdown for the week
        summary.append("\nWeekly Pollutant Breakdown:\n");
        Map<String, Double> weeklyPollutants = telemetryService.calculateWeeklyPollutants(nearestDevice.getDeviceId(), LocalDate.now().minusDays(7));

        // Define recommended pollutant levels
        double recommendedPm25 = 25.0;
        double recommendedPm10 = 50.0;
        double recommendedCo = 9.0;
        double recommendedNo2 = 0.040;
        double recommendedSo2 = 0.75;
        double recommendedO3 = 0.070;

        // Compare pollutants for the past week
        compareWeeklyPollutantsWithRecommendation(weeklyPollutants, summary, recommendedPm25, recommendedPm10, recommendedCo, recommendedNo2, recommendedSo2, recommendedO3);

        // Health alerts for the week
        summary.append("\nHealth Alerts for the Week:\n");
        String healthAlerts = generateWeeklyHealthAlerts(weeklyPollutants);
        summary.append(healthAlerts);

        // User Notification Preferences
        summary.append("\nNotification Preferences:\n");
        summary.append("You are subscribed to weekly air quality updates and will be notified when the AQI exceeds ").append(user.getUserPreferences().getFirst().getAqiThreshold()).append(" for any day in the week.\n");

        return summary.toString();
    }

    private void compareWeeklyPollutantsWithRecommendation(Map<String, Double> weeklyPollutants, StringBuilder summary,
                                                           double recommendedPm25, double recommendedPm10, double recommendedCo,
                                                           double recommendedNo2, double recommendedSo2, double recommendedO3) {
        // PM2.5
        double pm25 = weeklyPollutants.get("averagePm25");
        if (pm25 > recommendedPm25) {
            summary.append(String.format("PM2.5 levels for the week averaged %.1f µg/m³, slightly above the recommended %.1f µg/m³.\n", pm25, recommendedPm25));
        } else {
            summary.append(String.format("PM2.5 levels for the week averaged %.1f µg/m³, within the recommended limit of %.1f µg/m³.\n", pm25, recommendedPm25));
        }

        // PM10
        double pm10 = weeklyPollutants.get("averagePm10");
        if (pm10 > recommendedPm10) {
            summary.append(String.format("PM10 levels for the week averaged %.1f µg/m³, slightly above the recommended %.1f µg/m³.\n", pm10, recommendedPm10));
        } else {
            summary.append(String.format("PM10 levels for the week averaged %.1f µg/m³, within the recommended limit of %.1f µg/m³.\n", pm10, recommendedPm10));
        }

        // CO
        double co = weeklyPollutants.get("averageCo");
        if (co > recommendedCo) {
            summary.append(String.format("CO levels for the week averaged %.1f ppm, above the recommended %.1f ppm.\n", co, recommendedCo));
        } else {
            summary.append(String.format("CO levels for the week averaged %.1f ppm, within the recommended limit of %.1f ppm.\n", co, recommendedCo));
        }

        // NO2
        double no2 = weeklyPollutants.get("averageNo2");
        if (no2 > recommendedNo2) {
            summary.append(String.format("NO2 levels for the week averaged %.3f ppm, above the recommended %.3f ppm.\n", no2, recommendedNo2));
        } else {
            summary.append(String.format("NO2 levels for the week averaged %.3f ppm, within the recommended limit of %.3f ppm.\n", no2, recommendedNo2));
        }

        // SO2
        double so2 = weeklyPollutants.get("averageSo2");
        if (so2 > recommendedSo2) {
            summary.append(String.format("SO2 levels for the week averaged %.3f ppm, above the recommended %.1f ppm.\n", so2, recommendedSo2));
        } else {
            summary.append(String.format("SO2 levels for the week averaged %.3f ppm, within the recommended limit of %.1f ppm.\n", so2, recommendedSo2));
        }

        // O3
        double o3 = weeklyPollutants.get("averageO3");
        if (o3 > recommendedO3) {
            summary.append(String.format("O3 levels for the week averaged %.3f ppm, above the recommended %.1f ppm.\n", o3, recommendedO3));
        } else {
            summary.append(String.format("O3 levels for the week averaged %.3f ppm, within the recommended limit of %.1f ppm.\n", o3, recommendedO3));
        }
    }

    private String generateWeeklyHealthAlerts(Map<String, Double> weeklyPollutants) {
        StringBuilder healthAlerts = new StringBuilder();

        // Define the recommended values for pollutants
        double recommendedPm25 = 25.0;
        double recommendedPm10 = 50.0;
        double recommendedCo = 9.0;
        double recommendedNo2 = 0.040;
        double recommendedSo2 = 0.75;
        double recommendedO3 = 0.070;

        String mostImpactfulPollutant = getMostImpactfulPollutant(weeklyPollutants);
        healthAlerts.append("\nThe pollutant with the most impact on the AQI this week was: ").append(mostImpactfulPollutant).append("\n");

        // Generate health advice based on the most impactful pollutant
        String healthAdviceForPollutant = getHealthAdviceForPollutant(mostImpactfulPollutant);
        healthAlerts.append(healthAdviceForPollutant).append("\n");

        // PM2.5
        double pm25 = weeklyPollutants.get("averagePm25");
        pm25 = Math.round(pm25 * 100.0) / 100.0;
        if (pm25 > recommendedPm25) {
            healthAlerts.append("Warning: PM2.5 levels have been high this week (average: ").append(pm25)
                    .append(" µg/m³). Sensitive groups should take extra precautions.\n");
        }

        // PM10
        double pm10 = weeklyPollutants.get("averagePm10");
        pm10 = Math.round(pm10 * 100.0) / 100.0;
        if (pm10 > recommendedPm10) {
            healthAlerts.append("Warning: PM10 levels have been high this week (average: ").append(pm10)
                    .append(" µg/m³). Sensitive groups should take extra precautions.\n");
        }

        // CO
        double co = weeklyPollutants.get("averageCo");
        co = Math.round(co * 100.0) / 100.0;
        if (co > recommendedCo) {
            healthAlerts.append("Warning: CO levels have been high this week (average: ").append(co)
                    .append(" ppm). Individuals with heart conditions should avoid outdoor activities.\n");
        }

        // NO2
        double no2 = weeklyPollutants.get("averageNo2");
        no2 = Math.round(no2 * 1000.0) / 1000.0;
        if (no2 > recommendedNo2) {
            healthAlerts.append("Warning: NO2 levels have been high this week (average: ").append(no2)
                    .append(" ppm). People with asthma or respiratory conditions should limit outdoor activities.\n");
        }

        // SO2
        double so2 = weeklyPollutants.get("averageSo2");
        so2 = Math.round(so2 * 1000.0) / 1000.0;
        if (so2 > recommendedSo2) {
            healthAlerts.append("Warning: SO2 levels have been high this week (average: ").append(so2)
                    .append(" ppm). People with respiratory issues should minimize outdoor activities.\n");
        }

        // O3
        double o3 = weeklyPollutants.get("averageO3");
        o3 = Math.round(o3 * 1000.0) / 1000.0;
        if (o3 > recommendedO3) {
            healthAlerts.append("Warning: O3 levels have been high this week (average: ").append(o3)
                    .append(" ppm). Sensitive individuals should avoid strenuous outdoor activities.\n");
        }

        // Return the health alerts generated based on the pollutant levels
        return healthAlerts.toString();
    }

}
