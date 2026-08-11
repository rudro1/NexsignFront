import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_apiKey,
  authDomain:        import.meta.env.VITE_authDomain,
  projectId:         import.meta.env.VITE_projectId,
  storageBucket:     import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId:             import.meta.env.VITE_appId,
};

const missingFirebase = ['VITE_apiKey', 'VITE_authDomain', 'VITE_projectId', 'VITE_appId']
  .filter(k => !import.meta.env[k]);
if (missingFirebase.length) {
  console.error(
    '[Firebase] Missing env vars:',
    missingFirebase.join(', '),
    '— add them in .env or Vercel project settings.',
  );
}

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(console.warn);

const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');

// ✅ Always show account picker
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, googleProvider };