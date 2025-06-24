package vn.vnpt_tech.airquality.air_quality_monitoring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vnpt_tech.airquality.air_quality_monitoring.service.SummaryService;

@RestController
@RequestMapping("/api")
public class SummaryController {

    @Autowired
    private SummaryService summaryService;

    // Endpoint to trigger Daily Summary manually
    @PostMapping("/send-daily-summary")
    public String sendDailySummary() {
        summaryService.sendManualDailySummary();
        return "Daily Summary Sent";
    }

    // Endpoint to trigger Weekly Summary manually
    @PostMapping("/send-weekly-summary")
    public String sendWeeklySummary() {
        summaryService.sendManualWeeklySummary();
        return "Weekly Summary Sent";
    }
}
