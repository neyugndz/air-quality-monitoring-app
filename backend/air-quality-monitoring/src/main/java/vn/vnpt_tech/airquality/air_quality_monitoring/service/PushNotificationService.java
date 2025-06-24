//package vn.vnpt_tech.airquality.air_quality_monitoring.service;
//
//import jakarta.validation.Payload;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//@Service
//public class PushNotificationService {
//    @Value("${vapid.public.key}")
//    private String vapidPublicKey;
//
//    @Value("${vapid.private.key}")
//    private String vapidPrivateKey;
//
//    public void sendNotification(String subscriptionJson, String message) throws WebPushException {
//        Pushy pushy = new Pushy(vapidPublicKey, vapidPrivateKey);
//        PushNotification notification = new PushNotification(subscriptionJson, message);
//
//        // Construct a WebPushMessage
//        WebPushMessage webPushMessage = new WebPushMessageBuilder()
//                .setPayload(new Payload(message))
//                .setSubscription(subscriptionJson)
//                .build();
//
//        // Send the push notification
//        pushy.sendMessage(webPushMessage);
//    }
//}
