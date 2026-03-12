
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseInstance, setFirebaseInstance] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const instance = initializeFirebase();
    setFirebaseInstance(instance);
  }, []);

  if (!firebaseInstance) {
    return null;
  }

  return (
    <FirebaseProvider
      app={firebaseInstance.app}
      firestore={firebaseInstance.firestore}
      auth={firebaseInstance.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
