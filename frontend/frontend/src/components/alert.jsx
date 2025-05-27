import React, { useState, useEffect } from 'react';

function AirQualityAlert({ currentAQI, userPreferences, onCustomizePreferences }) {
  // State for alert content and visibility
  const [alertContent, setAlertContent] = useState(null);
  const [visible, setVisible] = useState(false);

  // Evaluate alert when AQI or prefs change
  useEffect(() => {
    if (!currentAQI) {
      setVisible(false);
      setAlertContent(null);
      return;
    }

    // If user prefs exist, use them; else use defaults & prompt customization
    const prefs = userPreferences || {
      alertThreshold: 150,
      alertChannels: ['email', 'sms'], // default
    };

    if (currentAQI >= prefs.alertThreshold) {
      // Compose alert message based on AQI level
      let riskMsg;
      if (currentAQI <= 50) riskMsg = 'Good air quality.';
      else if (currentAQI <= 100) riskMsg = 'Moderate air quality.';
      else if (currentAQI <= 150) riskMsg = 'Unhealthy for sensitive groups.';
      else if (currentAQI <= 200) riskMsg = 'Unhealthy - reduce outdoor activity.';
      else if (currentAQI <= 300) riskMsg = 'Very unhealthy - stay indoors.';
      else riskMsg = 'Hazardous air quality! Take precautions immediately.';

      setAlertContent({
        title: `Air Quality Alert: AQI ${currentAQI}`,
        message: riskMsg,
        needsCustomization: !userPreferences,
      });
      setVisible(true);
    } else {
      setVisible(false);
      setAlertContent(null);
    }
  }, [currentAQI, userPreferences]);

  if (!visible || !alertContent) return null;

  return (
    <div style={{
      backgroundColor: '#fdecea',
      border: '1px solid #f44336',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      color: '#b71c1c',
      position: 'relative'
    }}>
      <strong>{alertContent.title}</strong>
      <p>{alertContent.message}</p>

      {alertContent.needsCustomization && (
        <p>
          You have no notification preferences set.{' '}
          <button
            onClick={onCustomizePreferences}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Customize Preferences
          </button>
        </p>
      )}

      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss alert"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          color: '#b71c1c',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default AirQualityAlert;
