import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const configAny = firebaseConfig as any;
export const isRemixed = configAny?.apiKey?.includes('remixed') || !configAny?.apiKey;

export let app: any = null;
export let db: any = null;
export let auth: any = null;

if (!isRemixed) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    if (configAny.firestoreDatabaseId) {
      db = getFirestore(app, configAny.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    auth = getAuth(app);
  } catch (e) {
    console.warn("Firebase Init Error", e);
  }
}

// Ensure auth is at least a valid dummy if not initialized
if (!auth) {
  auth = {
    isDummy: true,
    currentUser: null,
    onAuthStateChanged: (cb: any) => {
      cb(null);
      return () => {};
    }
  };
}

export const googleProvider = !isRemixed ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (!isRemixed) {
    throw new Error(JSON.stringify(errInfo));
  }
}

