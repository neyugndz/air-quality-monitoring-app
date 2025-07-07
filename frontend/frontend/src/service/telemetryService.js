import { get, post } from '../config/api';

export const TelemetryService = {
    singleAQI: (id) => get(`/telemetry/aqi/${id}`),
    singleRawDataAndAQI: (id) => get(`/telemetry/all-data/${id}`),
    pollutedTimePercentage: (id, date) => get(`/telemetry/polluted-time-percentage/${id}?date=${date}`),
    getDataOverTimeRange: (id, startDate, endDate) => get(`/telemetry/historical-range/${id}?startDate=${startDate}&endDate=${endDate}`),
    compareDataOverTimeRange: (id1, id2, startDate, endDate) => get(`/telemetry/compare/${id1}/${id2}?startDate=${startDate}&endDate=${endDate}`),
    // postForecastData: (deviceId, startTime, horizon) => post(`/forecast`, deviceId, startTime, horizon ),
    postForecastData: (deviceId, startTime, horizon) =>  post('/forecast', {deviceId, startTime, horizon}),
    getCachedTelemetry: (id) => get(`/cache/telemetry/${id}`),   
}