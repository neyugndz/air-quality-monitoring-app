package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.SensorReading;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    Optional<SensorReading> findTopByDeviceIdOrderByTimestampDesc(String deviceId);

    List<SensorReading> findByDeviceIdAndTimestampBetween(String email, LocalDateTime start, LocalDateTime end);
}
