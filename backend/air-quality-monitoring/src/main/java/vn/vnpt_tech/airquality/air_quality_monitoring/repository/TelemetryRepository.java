package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    Optional<Telemetry> findTopByDeviceIdOrderByTimestampDesc(String deviceId);

    List<Telemetry> findByDeviceIdAndTimestampBetween(String email, LocalDateTime start, LocalDateTime end);
}
