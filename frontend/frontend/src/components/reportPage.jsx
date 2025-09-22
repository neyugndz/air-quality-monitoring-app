import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from './header.jsx';
import { DeviceService } from '../service/deviceService.js';
import { TelemetryService } from '../service/telemetryService.js';
// import '../css/reportPage.css';

// Register Chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function ReportPage() {
    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [timePeriod, setTimePeriod] = useState('24h');
    const [checkedPollutants, setCheckedPollutants] = useState({});
    const [reportData, setReportData] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [averageComparisonData, setAverageComparisonData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const reportHeaderRef = useRef(null);
    const trendChartRef = useRef(null);
    const barChartRef = useRef(null);
    const statisticsTableRef = useRef(null);
    const comparisonTableRef = useRef(null);

    const pollutants = [
        { key: 'temperature', label: 'Temperature (°C)' },
        { key: 'pressure', label: 'Pressure (Pa)' },
        { key: 'humidity', label: 'Humidity (%)' },
        { key: 'co', label: 'CO (ppm)' },
        { key: 'so2', label: 'SO₂ (ppm)' },
        { key: 'pm25', label: 'PM2.5 (µg/m³)' },
        { key: 'pm10', label: 'PM10 (µg/m³)' },
        { key: 'o3', label: 'O₃ (ppm)' },
        { key: 'no2', label: 'NO₂ (ppm)' },
    ];

    useEffect(() => {
        DeviceService.index()
            .then(res => {
                setDevices(res.data);
            })
            .catch(err => console.error("Error loading devices ", err));
            const now = new Date();
            const start24h = new Date(now);
            start24h.setDate(now.getDate() - 1);
            setStartDate(start24h.toISOString().split('T')[0]);
            setEndDate(now.toISOString().split('T')[0]);
    }, []);
    

    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    const togglePollutant = (key) => {
        setCheckedPollutants(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleDeviceChange = (e) => {
        const { options } = e.target;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        const maxSelection = 3;

        if (selected.length > maxSelection) {
            alert(`You can only select max of ${maxSelection} station.`);
            setSelectedDevices(selected.slice(0, maxSelection)); 
            return;
        }
        setSelectedDevices(selected);
    };

    const handleTimePeriodChange = (e) => {
        const period = e.target.value;
        setTimePeriod(period);
        
        if (period !== 'custom') {
            const now = new Date();
            let start = new Date(now);
            const end = new Date(now);
            
            switch (period) {
                case '24h':
                    start.setDate(now.getDate() - 1);
                    break;
                case '7d':
                    start.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    start.setDate(now.getDate() - 30);
                    break;
                case 'last_week':
                    start.setDate(now.getDate() - now.getDay() - 6);
                    end.setDate(now.getDate() - now.getDay());
                    break;
                case 'last_month':
                    start.setDate(1);
                    end.setDate(0);
                    break;
                default:
                    start.setDate(now.getDate() - 1);
                    break;
            }
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
        }
    };

    const onGenerateReport = async () => {
        if (!selectedDevices.length || !startDate || !endDate || Object.values(checkedPollutants).every(v => !v)) {
            alert("Please select at least one device, one pollutant data and a time range");
            return;
        }

        const selectedPollutantKeys = Object.keys(checkedPollutants).filter(key => checkedPollutants[key]);
        const formattedStartDate = startDate; 
        const formattedEndDate = endDate; 

        try {

            const response = await TelemetryService.getReportData(selectedDevices, selectedPollutantKeys, formattedStartDate, formattedEndDate);
            setReportData(response.data.chartData);

            const newStatistics = response.data.statistics;
            setStatistics(newStatistics);
            const comparison = {};
                Object.keys(checkedPollutants).filter(k => checkedPollutants[k]).forEach(pollutantKey => {
                    const pollutantStats = newStatistics[pollutantKey];
                    if (!pollutantStats) return;

                    let bestStation = null;
                    let worstStation = null;
                    let minAvg = Infinity;
                    let maxAvg = -Infinity;

                    selectedDevices.forEach(deviceId => {
                        const avg = pollutantStats[deviceId]?.average;
                        if (avg !== undefined && avg !== null) {
                            if (avg < minAvg) {
                                minAvg = avg;
                                bestStation = deviceId;
                            }
                            if (avg > maxAvg) {
                                maxAvg = avg;
                                worstStation = deviceId;
                            }
                        }
                    });

                    if (bestStation && worstStation) {
                        comparison[pollutantKey] = {
                            best: devices.find(d => d.deviceId === bestStation)?.stationName,
                            worst: devices.find(d => d.deviceId === worstStation)?.stationName,
                        };
                    }
                });

                setComparisonData(comparison);

                const newAverageComparisonData = {
                    labels: selectedPollutantKeys.map(key => pollutants.find(p => p.key === key)?.label),
                    datasets: selectedDevices.map((deviceId, index) => {
                        const deviceName = devices.find(d => d.deviceId === deviceId)?.stationName;
                        const data = selectedPollutantKeys.map(pollutantKey =>
                            newStatistics?.[pollutantKey]?.[deviceId]?.average || 0
                        );
                        const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
                        return {
                            label: deviceName,
                            data: data,
                            backgroundColor: color,
                            borderColor: color,
                            borderWidth: 1,
                        };
                    }),
                };
                setAverageComparisonData(newAverageComparisonData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setReportData(null);
            setStatistics(null);
        }
    };

    const handleDownloadReport = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = 297;
        let yPos = 10;
        const margin = 10;
        const pageBreakMargin = 20;

        const addContent = async (ref, title = '') => {
            if (ref.current) {
                const canvas = await html2canvas(ref.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const imgHeight = canvas.height * (190) / canvas.width; // A4 width is 210mm, with 10mm margins on each side
                
                if (yPos + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }

                if (title) {
                    doc.setFontSize(16);
                    doc.text(title, margin, yPos);
                    yPos += 10;
                }
                
                doc.addImage(imgData, 'PNG', margin, yPos, 190, imgHeight);
                yPos += imgHeight + pageBreakMargin;
            }
        };

        // Add Report Header
        doc.setFontSize(22);
        doc.text('Air Quality Report', 105, 20, null, null, 'center');
        doc.setFontSize(14);
        doc.text(`From ${startDate} to ${endDate}`, 105, 30, null, null, 'center');
        yPos = 40;

        // Add Trend Chart
        await addContent(trendChartRef, 'Air Quality Trend Analysis');

        // Add Bar Chart
        if (averageComparisonData) {
            await addContent(barChartRef, 'Average Pollutant Index Comparison by Station');
        }

        // Add Statistics Table
        if (statistics) {
            await addContent(statisticsTableRef, 'Summary Statistics Table');
        }

        // Add Comparison Table
        if (comparisonData && Object.keys(comparisonData).length > 0) {
            await addContent(comparisonTableRef, 'Compare and Analyze Key Pollution Indicators');
        }
        
        doc.save(`air_quality_report_${startDate}_to_${endDate}.pdf`);
    };
    
    const trendChartData = {
        labels: reportData ? Object.values(reportData)[0]?.map(item => {
            if (timePeriod === '24h') {
                return item.formattedDate; 
            } else {
                return item.formattedDate.split(' ')[0]; 
            }
        }) : [],
        datasets: (() => {
        let datasetIndex = 0;
        return selectedDevices.flatMap(deviceId =>
            Object.keys(checkedPollutants)
                .filter(key => checkedPollutants[key])
                .map((pollutantKey) => {
                    const color = `hsl(${(datasetIndex++ * 40) % 360}, 70%, 50%)`;
                    return {
                        label: `${pollutants.find(p => p.key === pollutantKey)?.label} - ${devices.find(d => d.deviceId === deviceId)?.stationName}`,
                        data: reportData?.[deviceId]?.map(item => item[pollutantKey]),
                        borderColor: color,
                        backgroundColor: color.replace('70%, 50%)', '70%, 50%, 0.2)'),
                        tension: 0.4,
                    };
                })
        );
    })(),
    };
    
    const trendChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Air Quality Trend Analysis' },
        },
        scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { title: { display: true, text: 'Value' }, min: 0 },
        },
    };

    return (
        <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Header toggleSidebar={toggleSidebar}/>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <ul>
                    <li><Link to="/home"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
                    <li><Link to="/trend-analysis"><i className="fas fa-chart-line"></i> Trend Analysis</Link></li>
                    <li><Link to="/report"><i className="fas fa-file-export"></i> Custom Report</Link></li>
                    <li><Link to="/health-recommendations"><i className="fas fa-heart"></i> Health Recommendation</Link></li>
                    <li><Link to="/forecast"><i className="fas fa-cloud-sun"></i> Forecast</Link></li>
                </ul>
            </div>
            
            <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ padding: '20px' }}>
                <h1 style={{ color: '#253892', marginBottom: '20px' }}>Create Customized Air Quality Report</h1>

                {/* Filter Panel */}
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
                        {/* Date Range */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px' }}>Time range:</label>
                            <select value={timePeriod} onChange={handleTimePeriodChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="last_week">Last week</option>
                                <option value="last_month">Last month</option>
                                <option value="custom">Custom</option>
                            </select>
                            {timePeriod === 'custom' && (
                                <>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }} />
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }} />
                                </>
                            )}
                        </div>
                        
                        {/* Device Selection (Multi-select) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px' }}>Select station:</label>
                            <select multiple value={selectedDevices} onChange={handleDeviceChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px', cursor: 'pointer' }}>
                                {devices.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>{device.stationName}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Pollutant Selection */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>Select index:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {pollutants.map(p => (
                                    <label key={p.key} style={{ fontSize: '14px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={checkedPollutants[p.key] || false} onChange={() => togglePollutant(p.key)} style={{ marginRight: '5px' }} />
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button onClick={onGenerateReport} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Create Report
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                {reportData ? (
                    <>
                        <div ref={reportHeaderRef}>
                            <h2 style={{ color: '#222', textAlign: 'center' }}>Air Quality Report</h2>
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                From {startDate} To {endDate}
                            </p>
                        </div>
                        
                        {/* Trend Chart Section */}
                        <div ref={trendChartRef} style={{ marginBottom: '20px' }}>
                            <Line data={trendChartData} options={trendChartOptions} />
                        </div>

                        {/* Average Comparison Bar Chart */}
                        {averageComparisonData && (
                            <div ref={barChartRef} style={{ marginBottom: '20px' }}>
                                <h3>Average Pollutant Index Comparison by Station</h3>
                                <Bar
                                    data={averageComparisonData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: 'Average Pollutant Index Comparison' },
                                        },
                                        scales: {
                                            x: {
                                                title: { display: true, text: 'Pollutants' },
                                            },
                                            y: {
                                                title: { display: true, text: 'Average Value' },
                                                min: 0,
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}

                        <hr style={{margin: '40px 0'}} />
                        
                        {/* Statistics Table */}
                        <div ref={statisticsTableRef} style={{ marginBottom: '20px' }}>
                            <h3>Summary Statistics Table</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#e9ecef' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Statistics</th>
                                        {selectedDevices.map(deviceId => (
                                            <th key={deviceId} colSpan="3" style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>
                                                {devices.find(d => d.deviceId === deviceId)?.stationName}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {selectedDevices.flatMap(() => [
                                            <th key="avg" style={{ border: '1px solid #ccc' }}>Average</th>,
                                            <th key="min" style={{ border: '1px solid #ccc' }}>Minimum</th>,
                                            <th key="max" style={{ border: '1px solid #ccc' }}>Maximum</th>,
                                        ])}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(checkedPollutants).filter(k => checkedPollutants[k]).map(pollutantKey => (
                                        <tr key={pollutantKey} style={{ backgroundColor: '#fff', border: '1px solid #ccc' }}>
                                            <td style={{ padding: '10px', textAlign: 'left' }}>{pollutants.find(p => p.key === pollutantKey)?.label}</td>
                                            {selectedDevices.flatMap(deviceId => (
                                                <>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        {statistics?.[pollutantKey]?.[deviceId]?.average?.toFixed(2) || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        {statistics?.[pollutantKey]?.[deviceId]?.min?.toFixed(2) || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        {statistics?.[pollutantKey]?.[deviceId]?.max?.toFixed(2) || 'N/A'}
                                                    </td>
                                                </>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <hr style={{margin: '40px 0'}} />
                        
                        { /* Compare and analyze key pollution indicators */}
                        {comparisonData && Object.keys(comparisonData).length > 0 && (
                            <div ref={comparisonTableRef} style={{ marginBottom: '20px' }}>
                                <h3>Compare and Analyze Key Pollution Indicators</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#e9ecef' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', width: '25%' }}>Indicators</th>
                                            <th style={{ padding: '10px', textAlign: 'left', width: '37.5%' }}>Best Quality Station</th>
                                            <th style={{ padding: '10px', textAlign: 'left', width: '37.5%' }}>Worst Quality Station</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(comparisonData).map(pollutantKey => (
                                            <tr key={pollutantKey} style={{ backgroundColor: '#fff', border: '1px solid #ccc' }}>
                                                <td style={{ padding: '10px', textAlign: 'left' }}>{pollutants.find(p => p.key === pollutantKey)?.label}</td>
                                                <td style={{ padding: '10px', textAlign: 'left' }}>{comparisonData[pollutantKey].best || 'N/A'}</td>
                                                <td style={{ padding: '10px', textAlign: 'left' }}>{comparisonData[pollutantKey].worst || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Please select the options and press "Create Report" to view the data.</p>
                    </div>
                )}
            </div>
                
                {/* Download Button */}
                {reportData && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button onClick={handleDownloadReport} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Download Report in PDF (PDF)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportPage;