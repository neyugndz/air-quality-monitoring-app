package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {
    private String locationCustomization;
    private String displayLanguage;
    private Boolean showPollutionAlerts;
    private Boolean showHealthTips;
    private Boolean useLocation;
    private Boolean emailAlerts;
    private Boolean pushAlerts;
    private Boolean smsAlerts;
    private Integer aqiThreshold;
    private String notificationFrequency;
}

