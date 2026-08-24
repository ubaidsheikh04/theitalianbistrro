import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAEFG4vqNG0eqBkW3UfBI2dYBUa-wfXGX0",
  authDomain: "paymentgateway-15602101-4c0a3.firebaseapp.com",
  projectId: "paymentgateway-15602101-4c0a3",
  storageBucket: "paymentgateway-15602101-4c0a3.firebasestorage.app",
  messagingSenderId: "454178709859",
  appId: "1:454178709859:web:325cdec9a7c99265557356"
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export { app };

export const storage = getStorage(app);