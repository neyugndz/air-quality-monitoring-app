// src/firebase.js

const vapidPublicKey = 'BCUBVb_m1ZHRct3pYcOoQ46hz-AjDCwvn8NgLRHKAuz7Bw0Dp_vSrYFBo9sJurre9SmHmwDrvi3XNbeCHAWrdfo';
const vapidPrivateKey = 'UrfQAFIaqA8KFCW9ikfdPAP6bapLwjcWmGTaDUY7258'; 

export const subscribeUserToPushNotifications = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;

        // Attempt to subscribe using the PushManager
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // User should be able to see notifications
            applicationServerKey: urlB64ToUint8Array(vapidPublicKey) // Make sure this key is correct
        });

        console.log('Subscription object:', subscription);

        // Send the subscription to the backend
        await fetch('http://localhost:8080/api/notifications/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        console.log('Subscription sent to the backend successfully!');
    } catch (error) {
        console.error('Subscription failed:', error);
        // Log more details about the error for debugging
        if (error.name === 'AbortError') {
            console.error('Push service error occurred during subscription.');
        }
    }
};

// Utility function to convert VAPID key to Uint8Array
const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};
