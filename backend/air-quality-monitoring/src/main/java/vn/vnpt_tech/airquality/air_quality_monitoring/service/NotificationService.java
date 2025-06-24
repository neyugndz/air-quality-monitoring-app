package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;

@Service
public class NotificationService {

    @Autowired
    private EmailService emailService;

    public void sendSummary(Users user, String summaryType) {
        // You can implement logic to send either an email, push notification, or any other form of alert here.
        String subject = summaryType + " for " + user.getName();
        String body = "Here is your " + summaryType + "...";

        // For example, sending an email:
        emailService.send(user.getEmail(), subject, body);
    }
}
