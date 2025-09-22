package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TelemetryDTO {
    private String deviceId;
    private String formattedDate;
    private Double pm25;
    private Double pm10;
    private Double co;
    private Double so2;
    private Double no2;
    private Double o3;
    private Double temperature, pressure, humidity;
    private Integer overallAqi;
}
