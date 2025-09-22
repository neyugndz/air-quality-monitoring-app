import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Header from './header.jsx';
import { DeviceService } from '../service/deviceService.js';
import { UserService } from '../service/userService.js';
import { useNotification } from './notificationProvider.jsx';
import { TelemetryService } from '../service/telemetryService.js';
import { ThreeDots } from 'react-loader-spinner';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
function ForecastPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [forecastValues, setForecastValues] = useState({
    '24h': [],
    '3d': [],
    '7d': []
  });
  const [forecastRange, setForecastRange] = useState('24h');
  const [forecastLabels, setForecastLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChartRendered, setIsChartRendered] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true); // Track the first render
  const { showNotification } = useNotification();
  const [selectedPollutant, setSelectedPollutant] = useState('AQI');

  const pollutants = ['AQI', 'PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO', 'Temperature', 'Humidity', 'Pressure'];
 
  const pollutantKeyMap = {
      'AQI': 'aqi',
      'PM2.5': 'pm25',
      'PM10': 'pm10',
      'O3': 'o3',
      'NO2': 'no2',
      'SO2': 'so2',
      'CO': 'co',
      'Temperature': 'temperature',
      'Humidity': 'humidity',   
      'Pressure': 'pressure'   
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
      DeviceService.index()
          .then(res => {
          setDevices(res.data);
          if(res.data.length > 0) {
              setSelectedDeviceId(res.data[0]?.deviceId);
          }
          })
          .catch(err => console.error("Error loading devices ", err));
  }, []);


  useEffect(() => {
    if (!selectedDeviceId) return;
  
    DeviceService.single(selectedDeviceId)
      .then(res => {
        const { stationName, overallAqi } = res.data;  // Destructure the specific attributes
        setDeviceData({
          stationName 
        });
        setAqi(overallAqi);
      })
      .catch(err => {
        console.error('Error loading device data', err);
        setDeviceData(null);
      });
  }, [selectedDeviceId]);

  /**
   * Fetch User Profile
   */
  useEffect(() => {
    UserService.single()
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile", err);
        setLoading(false);
      })
  }, [])

  useEffect(() => {
    UserService.singlePreferences()
      .then(res => {
        setPreferences(res.data);
      })
      .catch(err => {
        console.error("Error fetching preferences", err);
      });
  }, []);

  /**
   * Fetch forecast data whenever the selected device or forecast range changes
   */
  useEffect(() => {
    if (!selectedDeviceId) return;

    const startTime = new Date().toISOString();
    const horizon = forecastRange === '24h' ? 24 : forecastRange === '3d' ? 72 : 168;

    setLoading(true);
    console.log('Fetching forecast data...')
    TelemetryService.postForecastData(selectedDeviceId, startTime, horizon, selectedPollutant)
      .then(res => {
        console.log("API Response:", res); 
    // Kiểm tra nếu dữ liệu trả về rỗng hoặc không có thuộc tính `data`
      if (!res || !res.data) {
        console.error("Forecast data is empty or malformed", res);
        setForecastValues({
        '24h': [],
        '3d': [],
        '7d': []
      });
      setLoading(false);
      return;
    }

    let updatedForecast = { ...forecastValues };

    // Lấy dữ liệu dự báo cho chất ô nhiễm đã chọn
    const forecastData = res.data[pollutantKeyMap[selectedPollutant]] || [];

    if (forecastRange === '3d') {
      const dailyAverages = [];
      // Lấy trung bình cộng của mỗi 24 giờ trong 3 ngày
      for (let i = 0; i < 3; i++) {
      const dailyData = forecastData.slice(i * 24, (i + 1) * 24);
      const averageValue = dailyData.reduce((acc, value) => acc + value, 0) / dailyData.length;
      dailyAverages.push(averageValue);
    }
      updatedForecast['3d'] = dailyAverages;
    } else if (forecastRange === '7d') {
      const dailyAverages = [];
    // Lấy trung bình cộng của mỗi 24 giờ trong 7 ngày
    for (let i = 0; i < 7; i++) {
      const dailyData = forecastData.slice(i * 24, (i + 1) * 24);
      const averageValue = dailyData.reduce((acc, value) => acc + value, 0) / dailyData.length;
      dailyAverages.push(averageValue);
    }
      updatedForecast['7d'] = dailyAverages;
    } else {
      updatedForecast['24h'] = forecastData;
    }
  
      const labels = generateForecastLabels(forecastRange);
      setForecastLabels(labels);

      setForecastValues(updatedForecast);
      setLoading(false);  
  })
    .catch(err => {
      console.error("Error fetching forecast", err);
      setForecastValues({
        '24h': [],
        '3d': [],
        '7d': []
      });
      setLoading(false);
    });
  }, [selectedDeviceId, forecastRange, selectedPollutant]);

  const generateForecastLabels = (forecastRange) => {
    const labels = [];
    const currentDate = new Date();

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    if (forecastRange === '24h') {
      for (let i = 0; i < 24; i++) {
        const newDate = new Date(currentDate);
        newDate.setHours(currentDate.getHours() + i);
        labels.push(`${newDate.getHours()}:00`);
      }
    } else if (forecastRange === '3d') {
      for (let i = 0; i < 3; i++) {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + i);
        labels.push(`Day ${i + 1} (${formatDate(newDate)})`);
      }
    } else if (forecastRange === '7d') {
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + i);
        labels.push(`${formatDate(newDate)} (${newDate.toLocaleDateString('en-US', { weekday: 'short' })})`);
      }
    }
    return labels;
  };
  
  /**
   * Reset chart render status whenever forecast data changes
   */
  useEffect(() => {

    // Skip the reset on the first render
    if (isFirstRender) {
      setIsFirstRender(false); // After the first render, set it to false
      console.log(selectedDeviceId)
      return;
    }

    if (!loading) {
      setIsChartRendered(false);
      console.log('Chart is being reset');
    }
  }, [forecastValues, forecastRange, loading]);
  

  const getAQIColor = (value) => {
    let backgroundColor, fontColor;

    if (typeof value !== 'number') {
      console.error("Invalid value for AQI: ", value); 
      return { backgroundColor: '#000000', fontColor: '#ffffff' };
    }

    if (value <= 50) {
      backgroundColor = '#00e400'; 
      fontColor = '#ffffff'; 
    } else if (value <= 100) {
      backgroundColor = '#ffff00'; 
      fontColor = '#333333'; 
    } else if (value <= 150) {
      backgroundColor = '#ff7e00'; 
      fontColor = '#ffffff'; 
    } else if (value <= 200) {
      backgroundColor = '#ff0000'; 
      fontColor = '#ffffff'; 
    } else if (value <= 300) {
      backgroundColor = '#8f3f97'; 
      fontColor = '#ffffff'; 
    } else {
      backgroundColor = '#7e0023'; 
      fontColor = '#ffffff'; 
    }

    return { backgroundColor, fontColor }; 
  };

  const getPollutantColor = (value, pollutant) => {
    let backgroundColor, fontColor;

    if (typeof value !== 'number') {
        return { backgroundColor: '#000000', fontColor: '#ffffff' };
    }

    const thresholds = {
        'AQI': [50, 100, 150, 200, 300],
        'PM2.5': [12, 35.5, 55.5, 150.5, 250.5],
        'PM10': [54, 154, 254, 354, 424],
        'O3': [54, 70, 85, 105, 200],
        'NO2': [53, 100, 360, 649, 1249],
        'SO2': [35, 75, 185, 304, 604],
        'CO': [4.4, 9.4, 12.4, 15.4, 30.4],
        'Temperature': [0, 15, 25, 35, 40], 
        'Humidity': [30, 50, 70, 90, 100], 
        'Pressure': [980, 1000, 1013, 1030, 1050]
    };

    const colors = [
        '#00e400', // Tốt
        '#ffff00', // Trung bình
        '#ff7e00', // Nhạy cảm
        '#ff0000', // Không lành mạnh
        '#8f3f97', // Rất không lành mạnh
        '#7e0023'  // Nguy hiểm
    ];

    const textColor = ['#ffffff', '#333333', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];

    if (!thresholds[pollutant]) {
        return { backgroundColor: '#253892', fontColor: '#ffffff' };
    }

    let index = 0;
    while (index < thresholds[pollutant].length && value > thresholds[pollutant][index]) {
        index++;
    }

    backgroundColor = colors[index];
    fontColor = textColor[index];

    return { backgroundColor, fontColor };
  };

  // Define alert logic for AQI
  const checkForHealthAlerts = (forecastValues, pollutant) => {
    const thresholds = {
      'AQI': 100,
      'PM2.5': 35.5,
      'PM10': 154,
      'O3': 70,
      'NO2': 100,
      'SO2': 75,
      'CO': 9.4,
    };
    const threshold = preferences?.aqiThreshold || thresholds[pollutant] || 100;
    const highPollutant = forecastValues.some(value => value > threshold);

    const getThresholdExceedingPercentage = (values, threshold) => {
      const countAboveThreshold = values.filter(value => value > threshold).length;
      return (countAboveThreshold / values.length) * 100;
    };

    const { backgroundColor, fontColor } = getThresholdExceedingPercentage(forecastValues, threshold) > 50
      ? getPollutantColor(Math.max(...forecastValues), pollutant)
      : getPollutantColor(0, pollutant);

    if (highPollutant) {
      let timeRangeMessage = '';
      if (forecastRange === '24h') {
        timeRangeMessage = 'in the next 24 hours';
      } else if (forecastRange === '3d') {
        timeRangeMessage = 'in the next 3 days';
      } else if (forecastRange === '7d') {
        timeRangeMessage = 'in the next 7 days';
      }

      return (
        <div style={{ backgroundColor: backgroundColor, padding: '12px', borderRadius: '8px', marginTop: '20px' }}>
          <h4 style={{ color: fontColor }}>Important {pollutant} Alert</h4>
          <p style={{ color: fontColor }}>
            <strong>Warning:</strong> The {pollutant} level is expected to exceed {threshold} {timeRangeMessage}.
            Please take necessary precautions such as staying indoors or using air purifiers.
          </p>
        </div>
      );
    }
    return null;
  };

  // Generate lightweigth health advices for time range
  const generateHealthAdvice = (forecastValues, profile, pollutant, forecastRange) => {
    let adviceList = [];
    const thresholds = {
      'AQI': 100,
      'PM2.5': 35.5,
      'PM10': 154,
      'O3': 70,
      'NO2': 100,
      'SO2': 75,
      'CO': 9.4,
    };
    const threshold = preferences?.aqiThreshold || thresholds[pollutant] || 100;

    const timeFrameAdvice = `For the ${forecastRange === '24h' ? 'next 24 hours' : forecastRange === '3d' ? 'next 3 days' : 'next 7 days'}`;

    const averageValue = forecastValues.reduce((acc, value) => acc + value, 0) / forecastValues.length;
    const { backgroundColor, fontColor } = getPollutantColor(averageValue, pollutant);

    if (averageValue <= threshold) {
      adviceList.push(`${timeFrameAdvice}, the air quality is good (average ${pollutant}: ${averageValue.toFixed(2)}). You can enjoy outdoor activities.`);
    } else {
      let advice = `${timeFrameAdvice}, the air quality is unhealthy (average ${pollutant}: ${averageValue.toFixed(2)}). Stay indoors if possible.`;
      if (profile?.respiratoryDisease) {
        advice += " Sensitive individuals should limit outdoor activities.";
      }
      if (profile?.pregnant || profile?.smoker) {
        advice += " Pregnant individuals and smokers should avoid outdoor exposure.";
      }
      adviceList.push(advice);
    }
    return adviceList;
  };
  
  return (
    <div className="home-page" style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Header toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/home"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
          <li><Link to="/trend-analysis"><i className="fas fa-chart-line"></i> Trend Analysis</Link></li>
          <li><Link to="/report"><i className="fas fa-file-export"></i> Custom Report</Link></li>
          <li><Link to="/health-recommendations"><i className="fas fa-heart"></i> Health Recommendation</Link></li>
          <li><Link to="/forecast"><i className="fas fa-cloud-sun"></i> Forecast</Link></li>
        </ul>
      </div>

      <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8' }}>
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', color: '#253892' }}>Air Quality Forecast</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={forecastRange}
                onChange={(e) => setForecastRange(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
              >
                <option value="24h">Next 24 Hours</option>
                <option value="3d">Next 3 Days</option>
                <option value="7d">Next 7 Days</option>
              </select>
              <select
                value={selectedPollutant}
                onChange={(e) => setSelectedPollutant(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
              >
                {pollutants.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="station-select">
                <label htmlFor="stationDropdown" style={{ fontSize: '16px' }}>Select station:</label>
                <select
                  id="stationDropdown"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  style={{
                    fontSize: '14px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <h3>Loading... Please wait.</h3>
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '8px solid #f3f3f3',
                  borderTop: '8px solid #3498db',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '20px', color: '#253892', marginBottom: '12px' }}>
                  {`${selectedPollutant} Forecast for ${deviceData?.stationName || 'Unknown '} Station (${forecastRange === '24h' ? 'Next 24 Hours' : forecastRange === '3d' ? 'Next 3 Days' : 'Next 7 Days'})`}
                </h3>
                <Line
                  data={{
                    labels: forecastLabels,
                    datasets: [
                      {
                        label: `Predicted ${selectedPollutant}`,
                        data: forecastValues[forecastRange] ,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: (forecastValues[forecastRange] || []).map(value => getPollutantColor(value, selectedPollutant).backgroundColor)
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${selectedPollutant}: ${context.raw}`
                        }
                      }
                    },
                    animation: {
                      delay: 0,
                    },
                    scales: {
                      x: { title: { display: true, text: 'Time' } },
                      y: { title: { display: true, text: `${selectedPollutant} Index` }, min: 0, max: selectedPollutant === 'AQI' ? 600 : undefined }
                    }
                  }}
                />
              </div>
              {checkForHealthAlerts(forecastValues[forecastRange], selectedPollutant)}
              <div style={{
                backgroundColor: '#e8f4ff',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '6px solid #578FCA',
                marginTop: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#578FCA' }}>👨‍⚕️ Personalized Health Advice</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#333', lineHeight: 1.6, listStyleType: 'none' }}>
                  {generateHealthAdvice(forecastValues[forecastRange], profile, selectedPollutant, forecastRange).map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
                <Link to="/health-recommendations" style={{
                  padding: '8px 16px',
                  backgroundColor: '#578FCA',
                  color: 'white',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  display: 'inline-block',
                  marginTop: '10px'
                }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4a76a8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#578FCA'}>
                  View Full Health Advice
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForecastPage;
