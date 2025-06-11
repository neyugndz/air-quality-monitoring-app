package vn.vnpt_tech.airquality.air_quality_monitoring.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    private Users users;

    // User preferences
    private String locationCustomization;
    private String displayLanguage;
    private Boolean showPollutionAlerts;
    private Boolean showHealthTips;
    private Boolean useLocation;

    // Notification preferences
    private Boolean emailAlerts;
    private Boolean pushAlerts;
    private Boolean smsAlerts;
    private Integer aqiThreshold;
    private String notificationFrequency;
}

