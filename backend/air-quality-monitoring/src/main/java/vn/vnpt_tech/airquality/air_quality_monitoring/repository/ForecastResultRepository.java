package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.ForecastResult;

import java.time.LocalDateTime;

public interface ForecastResultRepository extends JpaRepository<ForecastResult, Long> {

//    ForecastResult findByDeviceIdAndStartTimeAndHorizon(String deviceId, String startTime, int horizon);

//    @Query("SELECT f FROM ForecastResult f WHERE f.deviceId = :deviceId " +
//            "AND f.startTime BETWEEN :startTimeMinusOneHour AND :startTimePlusOneHour " +
//            "AND f.horizon = :horizon")
//    ForecastResult findByDeviceIdAndStartTimeWithTolerance(
//            @Param("deviceId") String deviceId,
//            @Param("startTimeMinusOneHour") LocalDateTime startTimeMinusOneHour,
//            @Param("startTimePlusOneHour") LocalDateTime startTimePlusOneHour,
//            @Param("horizon") int horizon
//    );

    @Query("SELECT f FROM ForecastResult f WHERE f.deviceId = :deviceId " +
            "AND f.createdAt BETWEEN :startTimeMinusOneHour AND :startTimePlusOneHour " +
            "AND f.horizon = :horizon")
    ForecastResult findByDeviceIdAndCreationTimeWithTolerance(
            @Param("deviceId") String deviceId,
            @Param("startTimeMinusOneHour") LocalDateTime startTimeMinusOneHour,
            @Param("startTimePlusOneHour") LocalDateTime startTimePlusOneHour,
            @Param("horizon") int horizon
    );
}
