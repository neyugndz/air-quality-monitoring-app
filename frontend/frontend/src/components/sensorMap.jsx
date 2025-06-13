import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { DeviceService } from '../service/deviceService';
import { ThreeDots } from 'react-loader-spinner';
import { UserService } from '../service/userService';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Color category rules
const getAqiCategory = (aqi) => {
  if (aqi <= 50) {
    return { category: 'Good', backgroundColor: '#00e400'};
  } else if (aqi <= 100) {
    return { category: 'Moderate', backgroundColor: '#ffff00'};
  } else if (aqi <= 150) {
    return { category: 'Poor', backgroundColor: '#ff7e00'};
  } else if (aqi <= 200) {
    return { category: 'Bad', backgroundColor: '#ff0000'};
  } else if (aqi <= 300) {
    return { category: 'Dangerous', backgroundColor: '#8f3f97'};
  } else {
    return { category: 'Hazardous', backgroundColor: '#7e0023'};
  }
};

function SensorMap() {
  const [stationData, setStationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null); 

  useEffect(() => {
    DeviceService.allAqi()
      .then(res => {
        setStationData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading Station Data for Displaying', err);
        setStationData(null);
        setLoading(false);
      });

    // Fetch user location
    UserService.getLocation()
      .then(response => {
        const { latitude, longitude } = response.data;  
        setUserLocation({ lat: latitude, lon: longitude });
      })
      .catch(err => {
        console.error('Error fetching user location', err);
      });
  },[]);  




  // Function to create the custom marker icon
  const createCustomIcon = (aqi) => {
    const { backgroundColor } = getAqiCategory(aqi);
    
    // Create the custom icon using HTML and CSS
    const icon = L.divIcon({
      className: 'leaflet-div-icon',
      html: `<div style="background-color: ${backgroundColor}; 
                        border-radius: 50%; 
                        width: 40px; 
                        height: 40px; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        color: black; 
                        font-weight: bold; 
                        font-size: 14px; 
                        border: 1px solid white;
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box;">
                ${aqi}
              </div>`,
      iconSize: [0, 0],
      iconAnchor: [20, 40], // Anchor to center the circle
      popupAnchor: [0, -35] // Position the popup above the marker
    });
    return icon;
  };


  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'leaflet-div-icon',
      html: `<div style="background-color: blue; 
                        border-radius: 50%; 
                        width: 12px; 
                        height: 12px; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        color: white; 
                        font-weight: bold; 
                        font-size: 10px; 
                        border: 1px solid white;
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box;">
              </div>`,
      iconSize: [0, 0],
      iconAnchor: [12, 24],
      popupAnchor: [0, -20]
    });
  };

  return (
    <div>
      {/* Show loading screen if data is still being fetched */}
      {loading ? (
    <div style={{ textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <h3>Loading... Please wait.</h3>
      <div>
        <ThreeDots 
          height="80" 
          width="80" 
          radius="9" 
          color="#00BFFF"
          ariaLabel="three-dots-loading" 
          visible={true} 
        />
      </div>
    </div>
      ) : (
        // MapContainer with markers
        <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ marginTop: '-10px', height: '70vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {stationData && stationData.map((sensor, idx) => {
            // Create a custom icon with the background color based on AQI
            const customIcon = createCustomIcon(sensor.overallAqi);

            return (
              <Marker 
              key={idx} 
              position={[sensor.latitude, sensor.longitude]} 
              icon={customIcon}  
              >
                <Popup>
                  <b>Station Name: {sensor.stationName}</b>
                </Popup>
              </Marker>
            );
          })}
              {/* Add user's location on the map */}
              {userLocation && (
                <Marker 
                  position={[userLocation.lat, userLocation.lon]} 
                  icon={createUserLocationIcon()}  
                >
                  <Popup>
                    <b>Your Location</b>
                  </Popup>
                </Marker>
              )}


        </MapContainer>
      )}
    </div>
  );
}

export default SensorMap;
