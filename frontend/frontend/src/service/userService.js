import { get, put, patch } from '../config/api';

export const UserService = {
    single: () => get(`/users/profile`),
    singlePreferences: () => get(`/users/preferences`),
    patchProfile: (userData) => patch(`/users/profile`, userData),
    patchPreferences: (userData) => patch(`/users/preferences`, userData),
    putLocation: (locationData) => put(`/users/updateLocation`, locationData),
    getLocation: () => get(`/users/location`),
}