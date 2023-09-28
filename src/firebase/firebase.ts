import admin, { ServiceAccount } from 'firebase-admin';

import serviceAccount from '../firebase/movie.json';

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
