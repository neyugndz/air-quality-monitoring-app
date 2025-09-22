package vn.vnpt_tech.airquality.air_quality_monitoring.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class MqttService implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(MqttService.class);

    private MqttClient mqttClient;
    private final String BROKER = "tcp://192.168.1.23:1883";
    private final String CLIENT_ID = MqttClient.generateClientId();
    // Thay đổi chủ đề để lắng nghe tất cả các cảm biến giả lập
    private final String TOPIC = "sensors/+/telemetry";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private TelemetryService telemetryService;

    @PostConstruct
    public void connect() {
        try {
            mqttClient = new MqttClient(BROKER, CLIENT_ID);
            mqttClient.setCallback(this);
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            mqttClient.connect(options);
            mqttClient.subscribe(TOPIC);
            logger.info("Connected to MQTT Broker and subscribed to topic: {}", TOPIC);
        } catch (MqttException e) {
            logger.error("Failed to connect to MQTT Broker: {}", e.getMessage(), e);
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        String payload = new String(message.getPayload());
        logger.info("Message received from topic: {}, Payload: {}", topic, payload);

        try {
            Map<String, Object> telemetryData = objectMapper.readValue(payload, Map.class);
            String deviceId = topic.split("/")[1];

            telemetryService.processAndSaveTelemetryFromMqtt(deviceId, telemetryData);


        } catch (Exception e) {
            logger.error("❌ Error processing or parsing JSON payload: {}", e.getMessage(), e);
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        logger.error("Connection to MQTT Broker lost!", cause);
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Not used
    }

    @PreDestroy
    public void disconnect() {
        try {
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
                logger.info("Disconnected from MQTT Broker.");
            }
        } catch (MqttException e) {
            logger.error("Error disconnecting from MQTT Broker: {}", e.getMessage(), e);
        }
    }
}