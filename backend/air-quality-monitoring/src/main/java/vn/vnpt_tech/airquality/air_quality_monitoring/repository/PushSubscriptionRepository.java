package vn.vnpt_tech.airquality.air_quality_monitoring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.vnpt_tech.airquality.air_quality_monitoring.entity.PushSubscription;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
}
