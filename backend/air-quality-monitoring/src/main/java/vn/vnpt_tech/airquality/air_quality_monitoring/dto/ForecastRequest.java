package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastRequest {
    private String deviceId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String startTime;
    private int horizon;
    private String selectedPollutant;
}
