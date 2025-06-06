import { get, post, put, destroy } from '../config/api';

export const TelemetryService = {
    singleAQI: (id) => get(`/telemetry/aqi/${id}`),
    singleRawDataAndAQI: (id) => get(`/telemetry/all-data/${id}`),
    pollutedTimePercentage: (id, date) => get(`/telemetry/polluted-time-percentage/${id}?date=${date}`)
}