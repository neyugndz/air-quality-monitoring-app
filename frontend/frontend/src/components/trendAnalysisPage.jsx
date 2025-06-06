import React, { useState } from 'react';
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

function TrendAnalysisPage() {
    const [selectedPollutant, setSelectedPollutant] = useState('co');
    const [timeFormat, setTimeFormat] = useState('Day');
    const [timeValue, setTimeValue] = useState('2025-03-20');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    const pollutantOptions = {
        co: {
        label: 'CO (ppm)',
        data: [128, 130, 125, 140, 120, 110, 128],
        unit: 'ppm',
        },
        so2: {
        label: 'SO2 (ppm)',
        data: [12, 10, 11, 14, 9, 13, 12],
        unit: 'ppm',
        },
        pm25: {
        label: 'PM2.5 (µg/m³)',
        data: [294, 250, 260, 245, 270, 280, 294],
        unit: 'µg/m³',
        },
        pm10: {
        label: 'PM10 (µg/m³)',
        data: [180, 172, 185, 190, 200, 198, 180],
        unit: 'µg/m³',
        },
        o3: {
        label: 'O₃ (ppm)',
        data: [32, 34, 30, 36, 33, 29, 32],
        unit: 'ppm',
        },
        no2: {
        label: 'NO₂ (ppm)',
        data: [67, 70, 72, 68, 66, 65, 67],
        unit: 'ppm',
        },
    };

    return (
        <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh'  }}>
        <Header toggleSidebar={(toggleSidebar)} />

        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <ul>
            <li><Link to="/home">
                <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link></li>
            <li><Link to="/trend-analysis">
                <i className="fas fa-chart-line"></i> Trend Analysis
                </Link></li>
            <li><Link to="/health-recommendations">
                <i className="fas fa-heart"></i> Health Recommendation
                </Link></li>
            <li><Link to="/forecast">
                <i className="fas fa-cloud-sun"></i> Forecast
                </Link></li>
            </ul>
        </div>

        <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8'}}>
            <div style={{ maxWidth: '1000px', margin: '20px auto 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', color: '#253892' }}>Trend Analysis</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                    value={selectedPollutant}
                    onChange={(e) => setSelectedPollutant(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
                >
                    {Object.keys(pollutantOptions).map((key) => (
                    <option key={key} value={key}>{pollutantOptions[key].label}</option>
                    ))}
                </select>
                <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
                >
                    <option value="Day">Day</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                </select>
                <input
                    type={timeFormat === 'Day' ? 'date' : timeFormat === 'Week' ? 'week' : timeFormat === 'Month' ? 'month' : 'number'}
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    style={{ fontSize: '14px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}
                />
                </div>
            </div>

            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                <Line
                data={{
                    labels: ['01', '05', '10', '15', '20', '25', '30'], // Static time range for this example, can be dynamic
                    datasets: [
                    {
                        label: pollutantOptions[selectedPollutant].label,
                        data: pollutantOptions[selectedPollutant].data,
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
                    title: { display: true, text: `Trend Analysis of ${pollutantOptions[selectedPollutant].label} (${timeFormat} ${timeValue})` },
                    legend: { display: false },
                    },
                    scales: {
                    x: { title: { display: true, text: 'Time' } },
                    y: { title: { display: true, text: `Value (${pollutantOptions[selectedPollutant].unit})` }, min: 0 },
                    }
                }}
                />
            </div>
            </div>
        </div>
        </div>
    );
}

export default TrendAnalysisPage;
