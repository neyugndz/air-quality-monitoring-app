package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Telemetry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId;

    private Double latitude;
    private Double longitude;

    private Double pm25, pm10, co, so2, no2, o3;

    private Integer aqiPm25, aqiPm10, aqiCo, aqiSo2, aqiNo2, aqiO3;
    private Integer overallAqi;

    private LocalDateTime timestamp;
}
