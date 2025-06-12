package vn.vnpt_tech.airquality.air_quality_monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String email;
    private String name;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private Double heightCm;
    private Double weightKg;
    private Boolean asthma;
    private Boolean respiratoryDisease;
    private Boolean heartDisease;
    private Boolean allergies;
    private Boolean pregnant;
    private Boolean smoker;
    private String otherConditions;
}
