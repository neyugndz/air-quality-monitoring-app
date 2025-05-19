package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.Users;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByVerificationCode(String code);
    Optional<Users> findByResetCode(String code);
}
