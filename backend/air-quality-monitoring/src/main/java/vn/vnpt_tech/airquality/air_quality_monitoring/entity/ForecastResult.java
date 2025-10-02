package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String deviceId;
//    private String startTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

//    private LocalDateTime startTime;
    private int horizon;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String forecast;
}
