package vn.vnpt_tech.airquality.air_quality_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    @Id
    private String deviceId;

    private String deviceName;

    @Column(length = 1000)
    private String accessToken;

    private Double latitude;
    private Double longitude;

    @Transient
    private String stationName;

    public String getStationName() {
        if (deviceName == null)
            return "Unknown Station";

        return switch (deviceName) {
            case "DeviceNguyenTest1" -> "VNPT Technology";
            case "HoanKiemLakeSensor" -> "Hoan Kiem District";
            case "BaDinhSquareSensor" -> "Ba Dinh Square";
            case "USTHSensor" -> "USTH University";
            case "BacTuLiemIndustrialParkSensor" -> "Bac Tu Liem District";
            case "DongAnhDistrictSensor" -> "Dong Anh District";
            case "LongBienBridgeSensor" -> "Long Bien Bridge";
            case "NoiBaiAirportSensor" -> "Noi Bai Airport";
            case "CauGiayParkSensor" -> "Cau Giay Park";
            case "NgaTuSoSensor" -> "Nga Tu So Intersection";
            case "ThuLeParkSensor" -> "Thu Le Park";
            case "HaDongDistrictSensor" -> "Ha Dong District";
            case "DongXuanMarket" -> "Dong Xuan Market";
            case "PhamVanDongSensor" -> "Pham Van Dong Street";
            case "HoangMaiDistrictSensor" -> "Hoang Mai District";
            case "HanoiRailwayStationSensor" -> "Ha Noi Railway Station";
            default -> "Unknown Station";
        };
    }
}
