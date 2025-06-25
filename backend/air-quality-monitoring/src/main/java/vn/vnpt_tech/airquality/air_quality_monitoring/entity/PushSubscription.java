package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import nl.martijndwars.webpush.Subscription;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushSubscription {

    @Id
    private Long id;

    private String endpoint;

    // Embedding the Keys class (matching the Subscription structure)
    @Embedded
    private Keys keys;
    
    // Embeddable Keys class to hold p256dh and auth keys
    @Embeddable
    public static class Keys {
        private String p256dh;
        private String auth;

        // No-args constructor for JPA
        public Keys() {}

        public Keys(String p256dh, String auth) {
            this.p256dh = p256dh;
            this.auth = auth;
        }

        // Getters and setters
        public String getP256dh() {
            return p256dh;
        }

        public void setP256dh(String p256dh) {
            this.p256dh = p256dh;
        }

        public String getAuth() {
            return auth;
        }

        public void setAuth(String auth) {
            this.auth = auth;
        }
    }
}
