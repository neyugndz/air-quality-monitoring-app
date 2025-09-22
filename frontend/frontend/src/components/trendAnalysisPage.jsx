import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Header from './header.jsx';
import { DeviceService } from '../service/deviceService.js';
import { TelemetryService } from '../service/telemetryService.js';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TrendAnalysisPage() {
    const [selectedPollutant, setSelectedPollutant] = useState('co');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [selectedDeviceId2, setSelectedDeviceId2] = useState('');
    const [pollutantData, setPollutantData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [pollutantLabels, setPollutantLabels] = useState('');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };


    /**
       * Load Device List from backend
    */
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

    /**
     * Load pollutant data based on time range and selected device
     */
    useEffect(() => {
        if (selectedDeviceId && startDate && endDate) {
            // Fetch data for a single device over the time range
            TelemetryService.getDataOverTimeRange(selectedDeviceId, startDate, endDate)
                .then(res => {
                    
                    const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        const day = String(date.getDate()).padStart(2, '0');  
                        const month = String(date.getMonth() + 1).padStart(2, '0');  
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                    };

                    const labels = res.data.map(item => formatDate(item.formattedDate.split(' ')[0]));  
                    const uniqueLabels = [...new Set(labels)];

                    const selectedPollutantData = res.data.map(item => item[selectedPollutant]);

                    setPollutantData(selectedPollutantData); 
                    setPollutantLabels(uniqueLabels); 
                })
                .catch(err => console.error('Error fetching pollutant data:', err));
        }
    }, [selectedDeviceId, startDate, endDate, selectedPollutant]);

    /**
     * Load comparison data between two stations
     */
    useEffect(() => {
        if (selectedDeviceId && selectedDeviceId2 && startDate && endDate) {
            // Fetch comparison data for two devices over the time range
            TelemetryService.compareDataOverTimeRange(selectedDeviceId, selectedDeviceId2, startDate, endDate)
                .then(res => {
                    
                    const station1Data = res.data[selectedDeviceId]?.map(item => item[selectedPollutant]);
                    const station2Data = res.data[selectedDeviceId2]?.map(item => item[selectedPollutant]);
                    if (!station1Data || !station2Data) {
                        console.error('Error: Missing data for one of the stations.');
                        return;
                    }
    
                    // Set comparison data for the chart
                    setComparisonData([station1Data, station2Data]);
                })
                .catch(err => console.error('Error fetching comparison data:', err));
        }
    }, [selectedDeviceId, selectedDeviceId2, startDate, endDate, selectedPollutant]);
    

    const pollutantOptions = {
        co: {
        label: 'CO (ppm)',
        unit: 'ppm',
        },
        so2: {
        label: 'SO2 (ppm)',
        unit: 'ppm',
        },
        pm25: {
        label: 'PM2.5 (µg/m³)',
        unit: 'µg/m³',
        },
        pm10: {
        label: 'PM10 (µg/m³)',
        unit: 'µg/m³',
        },
        o3: {
        label: 'O₃ (ppm)',
        unit: 'ppm',
        },
        no2: {
        label: 'NO₂ (ppm)',
        unit: 'ppm',
        },
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    return (
    <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Header toggleSidebar={toggleSidebar}/>

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
            
            <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '24px' }}>
                {/* <h2 style={{ fontSize: '24px', color: '#253892' }}>Trend Analysis</h2> */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
                    <select
                        value={selectedPollutant}
                        onChange={(e) => setSelectedPollutant(e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
                    >
                        {Object.keys(pollutantOptions).map((key) => (
                            <option key={key} value={key}>{pollutantOptions[key].label}</option>
                        ))}
                    </select>
                    {/* Select the Date Range */}
                    <div style={{ display: 'flex',  alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'}}>
                        <label style={{ fontSize: '16px' }}>Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
                        />

                        <label style={{ fontSize: '16px' }}>End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
                        />
                    </div>
                    {/* Select the Station/ Device */}
                    <div className="station-select">
                        <label htmlFor="stationDropdown" style={{ fontSize: '16px' }}>Choose the first station:</label>
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

                    <div className="station-select">
                        <label htmlFor="stationDropdown" style={{ fontSize: '16px' }}>Choose the second station:</label>
                        <select
                            id="stationDropdown"
                            value={selectedDeviceId2}
                            onChange={(e) => setSelectedDeviceId2(e.target.value)}
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

            {/* Trend Analysis with Line Chart*/}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',  
                    gridTemplateRows: 'auto',        
                    gap: '20px',
                    alignItems: 'start',
                    width: '100%'                   
                }}
            >   
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', height: '60vh' }}>
                    <h3>Pollutant Trend Analysis</h3>
                    <Line
                        data={{
                            // labels: ['01', '05', '10', '15', '20', '25', '30'],
                            labels: pollutantLabels,
                            datasets: [
                                {
                                    label: pollutantOptions[selectedPollutant].label,
                                    data: pollutantData,
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4,
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                title: { 
                                    display: true, 
                                    // text: `Trend Analysis of ${pollutantOptions[selectedPollutant].label} Day ${convertToDisplayDate(startDate)} to ${convertToDisplayDate(endDate)})` 
                                    text: `Trend Analysis of ${pollutantOptions[selectedPollutant].label} Day ${startDate} to ${endDate})` 
                                },
                                legend: { 
                                    display: true, 
                                    position: 'top', 
                                },
                            },
                            scales: {
                                x: { 
                                    title: { 
                                        display: true, 
                                        text: 'Time' 
                                    } 
                                },
                                y: { 
                                    title: { 
                                        display: true, 
                                        text: `Value (${pollutantOptions[selectedPollutant].unit})` 
                                    }, 
                                    min: 0 
                                },
                            }
                        }}
                        style={{ width: '100%', height: '360px' }} 
                    />
                </div>

                {/* Pollutant Comparison between Station 1 and Station 2 with Bar Chart */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', height: '60vh' }}>
                    <h3>Pollutant Comparison Between Station 1 and Station 2</h3>
                    <Bar
                        data={{
                            labels: pollutantLabels,
                            datasets: [
                                {
                                    label: `${pollutantOptions[selectedPollutant].label} - Station 1`,
                                    data: comparisonData[0], 
                                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1,
                                },
                                {
                                    label: `${pollutantOptions[selectedPollutant].label} - Station 2`,
                                    data: comparisonData[1], 
                                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1,
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                title: { display: true, text: `Comparison of ${pollutantOptions[selectedPollutant].label} Between Stations` },
                                legend: { display: true, position: 'top' }, 
                            },
                            scales: {
                                x: { title: { display: true, text: 'Time' } },
                                y: { title: { display: true, text: `Value (${pollutantOptions[selectedPollutant].unit})` } },
                            }
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>
        </div>
    </div>
    );
}

export default TrendAnalysisPage;
