import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { api } from "./api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let messagingSingleton: Messaging | null = null;

const getMessagingSafe = async (): Promise<Messaging | null> => {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    if (messagingSingleton) return messagingSingleton;

    const app = initializeApp(firebaseConfig);
    messagingSingleton = getMessaging(app);
    return messagingSingleton;
  } catch {
    return null;
  }
};

export const ensureNotificationsRegistered = async () => {
  if (localStorage.getItem("demoMode")) return;

  const token = localStorage.getItem("accessToken");
  if (!token) return;

  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return;
  }

  const messaging = await getMessagingSafe();
  if (!messaging) return;

  // Register service worker (required for FCM on web)
  let swReg: ServiceWorkerRegistration | null = null;
  try {
    swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch {
    // ignore
  }

  // Request permission if needed
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // ignore
    }
  }

  if (Notification.permission !== "granted") return;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    // Without VAPID key web push token cannot be generated.
    console.warn(
      "FCM: missing VITE_FIREBASE_VAPID_KEY; cannot register for push."
    );
    return;
  }

  let fcmToken: string | null = null;
  try {
    fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg ?? undefined,
    });
  } catch (e) {
    console.warn("FCM: getToken failed", e);
    return;
  }

  if (!fcmToken) return;

  // Avoid spamming backend if token hasn't changed.
  const last = localStorage.getItem("fcmToken");
  if (last !== fcmToken) {
    try {
      await api.devices.register({
        token: fcmToken,
        platform: "web",
      });
      localStorage.setItem("fcmToken", fcmToken);
    } catch (e) {
      // ignore
    }
  }

  // Foreground notifications
  try {
    onMessage(messaging, (payload) => {
      try {
        const n = payload.notification;
        if (!n) return;
        if (Notification.permission !== "granted") return;
        const title = n.title || "Notification";
        const body = n.body || "";
        new Notification(title, { body, data: payload.data });
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
};

export const unregisterNotifications = async () => {
  const token = localStorage.getItem("fcmToken");
  if (!token) return;
  try {
    await api.devices.unregister({ token });
  } catch {
    // ignore
  }
  localStorage.removeItem("fcmToken");
};
