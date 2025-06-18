import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserService } from '../service/userService';

// Create a context to handle notifications
const NotificationContext = createContext();

// Use this hook in any component to show a notification
export const useNotification = () => useContext(NotificationContext);

// NotificationProvider to wrap the app with toast container
export const NotificationProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(null);

    useEffect(() => {
        // Fetch the user preferences once at the start
        UserService.singlePreferences()
        .then(res => {
            setPreferences(res.data);
        })
        .catch(err => console.error('Error fetching preferences', err));
    }, []);

    const showNotification = (message, type = 'info') => {
        toast[type](message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeButton: true,
        });
    };

     // Function to check for AQI threshold exceeding and show notification
    const checkForHealthAlerts = (forecastValues) => {
        if (!preferences) return;

        // Calculate the percentage of forecast values exceeding the threshold
        const getThresholdExceedingPercentage = (forecastValues, threshold) => {
            const countAboveThreshold = forecastValues.filter(value => value > threshold).length;
            return (countAboveThreshold / forecastValues.length) * 100;
        };

        const maxAqi = Math.max(...forecastValues); 

        const exceedsThreshold = getThresholdExceedingPercentage(forecastValues, preferences?.aqiThreshold) > 50;
        const timeRangeMessage = forecastValues.length === 24 ? "in the next 24 hours" : forecastValues.length === 3 ? "in the next 3 days" : "in the next 7 days";

        if (exceedsThreshold && preferences?.showPollutionAlerts) {
            const message = `AQI is forecasted to exceed ${preferences?.aqiThreshold} ${timeRangeMessage}. Please take necessary precautions.`;
            showNotification(message, 'warning');
        }
    };

    // Draft logic for triggering in-app notification
    useEffect(() => {
        if (!preferences) return; 

        if (preferences.showPollutionAlerts ) {
            // console.log("This is from the provider");
            const forecastValues = [180, 190, 100]; // Example forecast values, replace with actual data
            checkForHealthAlerts(forecastValues);
        }
    }, [preferences]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};
