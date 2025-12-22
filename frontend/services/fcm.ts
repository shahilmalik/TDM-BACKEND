import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { api } from "./api";

// Use a transparent 1x1 icon so notifications don't show the site's logo/favicon.
const TRANSPARENT_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9o0kAAAAASUVORK5CYII=";

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

const waitForServiceWorkerActivation = async (
  reg: ServiceWorkerRegistration,
  timeoutMs: number
): Promise<boolean> => {
  const started = Date.now();
  const sw = reg.installing || reg.waiting || reg.active;
  if (!sw) return false;

  // If already active, we're good.
  if (reg.active && reg.active.state === "activated") return true;

  return await new Promise<boolean>((resolve) => {
    const done = (ok: boolean) => {
      try {
        sw.removeEventListener("statechange", onStateChange);
      } catch {
        // ignore
      }
      resolve(ok);
    };

    const onStateChange = () => {
      const active = reg.active;
      if (active && active.state === "activated") return done(true);
      if (Date.now() - started > timeoutMs) return done(false);
    };

    try {
      sw.addEventListener("statechange", onStateChange);
    } catch {
      // ignore
    }

    // Also poll in case event doesn't fire.
    const interval = window.setInterval(() => {
      const active = reg.active;
      if (active && active.state === "activated") {
        window.clearInterval(interval);
        return done(true);
      }
      if (Date.now() - started > timeoutMs) {
        window.clearInterval(interval);
        return done(false);
      }
    }, 250);
  });
};

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

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Push + service workers require a secure context (localhost is OK; LAN IP over http is not).
  if (!window.isSecureContext) {
    console.warn(
      "FCM: not a secure context; open the app on https or localhost (not a LAN IP over http).",
      { origin: window.location.origin }
    );
    return;
  }

  console.info("FCM: registration attempt started");

  const messaging = await getMessagingSafe();
  if (!messaging) {
    console.info("FCM: messaging not supported in this browser");
    return;
  }

  // Register service worker (required for FCM on web)
  let swReg: ServiceWorkerRegistration | null = null;
  try {
    swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Ensure the SW is ready/activated before attempting PushManager subscription.
    try {
      await navigator.serviceWorker.ready;
    } catch {
      // ignore
    }

    const activated = await waitForServiceWorkerActivation(swReg, 8000);
    if (!activated) {
      console.warn("FCM: service worker not activated yet; retry after refresh");
    }
  } catch {
    // ignore
  }

  if (!swReg) {
    console.warn("FCM: service worker registration failed");
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
    console.warn("FCM: getToken failed", e, {
      notificationPermission: Notification.permission,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      hasServiceWorkerReg: Boolean(swReg),
      swScope: swReg?.scope,
      swState: swReg?.active?.state,
    });
    return;
  }

  if (!fcmToken) return;

  console.info(
    "FCM: obtained token",
    `${fcmToken.substring(0, 10)}...${fcmToken.slice(-10)}`
  );

  // Always upsert to backend so admin panel reflects the current token.
  try {
    await api.devices.register({
      token: fcmToken,
      platform: "web",
    });
    localStorage.setItem("fcmToken", fcmToken);
    console.info("FCM: registered token with backend /api/devices/register/");
  } catch (e) {
    console.warn("FCM: backend device register failed", e);
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
        new Notification(title, { body, data: payload.data, icon: TRANSPARENT_ICON });
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
