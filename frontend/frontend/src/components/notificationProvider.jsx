import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserService } from '../service/userService';

// Create a context to handle notifications
const NotificationContext = createContext();

// Use this hook in any component to show a notification
export const useNotification = () => useContext(NotificationContext);

// NotificationProvider to wrap the app with toast container
export const NotificationProvider = ({ children}) => {
    const [preferences, setPreferences] = useState(null);
    const [forecastValues, setForecastValues] = useState([]);

    
    const fetchPreferences = () => {
        UserService.singlePreferences()
            .then(res => {
                setPreferences(res.data);
            })
            .catch(err => {
                console.error('Error fetching preferences', err);
            });
    };

    useEffect(() => {
        // Initial fetch of user preferences
        fetchPreferences();

        const intervalId = setInterval(() => {
            fetchPreferences();
        }, 10000); // Fetch every 10 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const showNotification = (message, type = 'info') => {
        toast[type](message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeButton: true,
        });
    };

    //  Check current AQI
    const checkCurrentAqiAlert = (currentAqi) => {
        if (
            preferences?.showPollutionAlerts &&
            preferences?.notificationFrequency === "Immediate" &&
            currentAqi > preferences?.aqiThreshold
        ) {
            const message = `Current AQI (${currentAqi}) exceeds your threshold (${preferences.aqiThreshold}). Please take precautions.`;
            showNotification(message, 'error');
        }
    };

     // Function to check for AQI threshold exceeding and show notification
    const checkForHealthAlerts = (forecastValues) => {
        if (!preferences) return;

        if (!Array.isArray(forecastValues)) {
            console.error("Invalid forecast data:", forecastValues);
            return;
        }

        // Calculate the percentage of forecast values exceeding the threshold
        const getThresholdExceedingPercentage = (forecastValues, threshold) => {
            const countAboveThreshold = forecastValues.filter(value => value > threshold).length;
            return (countAboveThreshold / forecastValues.length) * 100;
        };

        const maxAqi = Math.max(...forecastValues); 

        const exceedsThreshold = getThresholdExceedingPercentage(forecastValues, preferences?.aqiThreshold) > 50;
        const timeRangeMessage = forecastValues.length === 24 ? "in the next 24 hours" : forecastValues.length === 3 ? "in the next 3 days" : "in the next 7 days";

        if (exceedsThreshold && 
            preferences?.showPollutionAlerts &&
            preferences?.notificationFrequency === "Immediate"
        ) {
            const message = `AQI is forecasted to exceed ${preferences?.aqiThreshold} ${timeRangeMessage}. Please take necessary precautions.`;
            showNotification(message, 'error');
        }
    };

    // Listening to real-time data using SSE (Server-Sent Events)
    useEffect(() => {
        if (!preferences) return;
    
        if (preferences.showPollutionAlerts && preferences.notificationFrequency === "Immediate") {
            const token = sessionStorage.getItem('jwt_token'); 
    
            // Make sure the token is available
            if (!token) {
                console.error("No token found");
                return;
            }
    
            const eventSourceUrl = `${process.env.REACT_APP_API_URL}/alerts`;
    
            const fetchStream = async () => {
                const response = await fetch(eventSourceUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'text/event-stream', 
                    }
                });
    
                if (!response.ok) {
                    console.error("Failed to fetch SSE stream");
                    return;
                }
    
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let utf8Str = '';
    
                // Read the stream
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    utf8Str += decoder.decode(value, { stream: true });

                    const events = utf8Str.split('\n\n');
    
                    for (let event of events) {
                        if (event) {
                            const forecastData = event.trim();
                            try {
                                const parsedForecast = JSON.parse(forecastData); 
    
                                if (Array.isArray(parsedForecast.forecast)) {
                                    setForecastValues(parsedForecast.forecast);  
                                    checkForHealthAlerts(parsedForecast.forecast); 
                                } else {
                                    console.error("Forecast data is not in expected array format.");
                                }
                            } catch (err) {
                                console.error("Error parsing forecast data:", err); 
                            }
                        }
                    }
    
                    // Keep the leftover part for the next read
                    utf8Str = events[events.length - 1];
                }
            };
    
            // Start the stream
            fetchStream();
    
            return () => {
                console.log("Stream closed");
            };
        }
    }, [preferences?.showPollutionAlerts, preferences?.notificationFrequency]);
    

  return (
    <NotificationContext.Provider value={{ showNotification, checkCurrentAqiAlert }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};
