package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.UserPreferences;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUsers(Users user);
}
