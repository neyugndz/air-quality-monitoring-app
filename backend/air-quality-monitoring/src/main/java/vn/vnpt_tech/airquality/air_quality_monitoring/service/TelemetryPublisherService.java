package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Service;

@Service
public class TelemetryPublisherService {
    @Autowired
    private MessageChannel mqttOutboundChannel;

    public void publishTelemetry(String payload) {
        mqttOutboundChannel.send(new GenericMessage<>(payload));
    }
}
