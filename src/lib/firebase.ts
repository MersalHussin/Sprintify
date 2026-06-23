import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

import env from "./env";

declare global {
  var _firebaseApp: App | undefined;
}

export function getFirebaseApp(): App {
  if(global._firebaseApp) return global._firebaseApp;

  const existingApp = getApps()[0];
  if(existingApp) {
    global._firebaseApp = existingApp;
    return global._firebaseApp;
  }

  global._firebaseApp = initializeApp({
    credential: cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
    }),
  });

  return global._firebaseApp;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
