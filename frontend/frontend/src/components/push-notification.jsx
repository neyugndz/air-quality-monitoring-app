import React from 'react';


export const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
};