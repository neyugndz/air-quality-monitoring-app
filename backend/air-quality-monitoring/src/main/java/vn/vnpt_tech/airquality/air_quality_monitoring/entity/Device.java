package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    @Id
    private String deviceId;

    private String deviceName;

    @Column(length = 1000)
    private String accessToken;

    private Double latitude;
    private Double longitude;
}
