import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function SensorMap() {
  const [sensorData, setSensorData] = useState([]);

  const fetchSensorData = () => {
    fetch("http://localhost:8080/api/sensor/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setSensorData(data));
  };

  return (
    <div>
      {/* <button onClick={fetchSensorData} style={{ marginBottom: '10px' }}>
        Load Sensor Data
      </button> */}

      <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{marginTop: '-10px', height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sensorData.map((sensor, idx) => (
          <Marker key={idx} position={[sensor.latitude, sensor.longitude]}>
            <Popup>
              <b>AQI: {sensor.overallAqi}</b><br />
              PM2.5: {sensor.pm25}<br />
              Temp: {sensor.temperature}°C
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default SensorMap;
