package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ForgotPasswordRequest {
    public String email;
}
