package vn.vnpt_tech.airquality.air_quality_monitoring.service;


import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.Subscription;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.vnpt_tech.airquality.air_quality_monitoring.controller.ForecastController;

import java.security.GeneralSecurityException;
import java.security.Security;

@Service
public class PushNotificationService {
    private static final String VAPID_PUBLIC_KEY = "BCUBVb_m1ZHRct3pYcOoQ46hz-AjDCwvn8NgLRHKAuz7Bw0Dp_vSrYFBo9sJurre9SmHmwDrvi3XNbeCHAWrdfo";
    private static final String VAPID_PRIVATE_KEY = "UrfQAFIaqA8KFCW9ikfdPAP6bapLwjcWmGTaDUY7258";
    private static final String VAPID_EMAIL = "mailto:dangnguyen180904@gmail.com";

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);


    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public PushNotificationService() throws GeneralSecurityException {
        PushService pushService = new PushService(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL);
    }

    public void sendPushNotification(Subscription subscription, String message) {
        try {
            // Log subscription details
            logger.info("Sending notification to endpoint: {}", subscription.endpoint);
            logger.info("Subscription public key (p256dh): {}", subscription.keys.p256dh);
            logger.info("Subscription auth key: {}", subscription.keys.auth);
            // Initialize web-push
            PushService pushService = new PushService(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL);

            logger.info("Sending notification to:{} ", subscription.endpoint );
            Notification notification = new Notification(subscription, message);

            logger.info("Sending message: {} ", message);
            pushService.send(notification);
            logger.info("Push notification sent successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error sending push notification", e);
        }
    }
}
