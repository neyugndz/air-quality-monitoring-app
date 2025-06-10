import { get } from '../config/api';

export const DeviceService = {
  index: () => get('/devices'), 
  single: (id) => get(`/devices/${id}/with-latest-telemetry`),
  allAqi: () => get(`devices/location-aqi`)
//   single: (id) => get(`/devices/${id}`),
//   create: (params) => post('/devices', params),
//   update: (id, params) => put(`/devices/${id}`, params), 
//   remove: (id) => destroy(`/devices/${id}`),
};