package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.UserPreferences;
import vn.vnpt_tech.airquality.air_quality_monitoring.repository.UserPreferencesRepository;

import java.util.List;

@Service
public class SummaryService {

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Autowired
    private NotificationService notificationService;

    // Scheduled method for Daily Summaries (only for automatic triggering at 8 AM)
    @Scheduled(cron = "0 0 8 * * ?")  // This will run every day at 8 AM
    public void sendDailySummaries() {
        sendSummaries("Daily Summary");
    }

    // Scheduled method for Weekly Summaries (only for automatic triggering every Monday at 8 AM)
    @Scheduled(cron = "0 0 8 ? * MON")  // Runs every Monday at 8 AM
    public void sendWeeklySummaries() {
        sendSummaries("Weekly Summary");
    }

    // Manual method to send Daily Summary
    public void sendManualDailySummary() {
        sendSummaries("Daily Summary");
    }

    // Manual method to send Weekly Summary
    public void sendManualWeeklySummary() {
        sendSummaries("Weekly Summary");
    }

    // Common method to send summaries based on type
    private void sendSummaries(String summaryType) {
        List<UserPreferences> preferences = userPreferencesRepository.findAll();

        for (UserPreferences pref : preferences) {
            if (summaryType.equals(pref.getNotificationFrequency())) {
                notificationService.sendSummary(pref.getUsers(), summaryType);
            }
        }
    }
}
