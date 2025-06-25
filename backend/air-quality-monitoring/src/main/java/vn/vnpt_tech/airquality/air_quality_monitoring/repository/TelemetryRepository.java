package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Telemetry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    Optional<Telemetry> findTopByDeviceIdOrderByTimestampDesc(String deviceId);

    List<Telemetry> findByDeviceId(String deviceId);

    List<Telemetry> findByDeviceIdAndTimestampBetween(String deviceId, LocalDateTime start, LocalDateTime end);

    Optional<Telemetry> findByDeviceIdAndTimestamp(String deviceId, LocalDateTime timestamp);

    @Query("SELECT t FROM Telemetry t WHERE t.deviceId = :deviceId AND FUNCTION('DATE', t.timestamp) = :date")
    List<Telemetry> findByDeviceIdAndDate(@Param("deviceId") String deviceId, @Param("date") LocalDate date);

}
