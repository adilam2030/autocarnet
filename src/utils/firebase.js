// src/utils/firebase.js
// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Remplacez ces valeurs par celles de votre projet Firebase
export const FIREBASE_CONFIG = {
  apiKey: 'VOTRE_API_KEY',
  authDomain: 'VOTRE_PROJECT.firebaseapp.com',
  projectId: 'VOTRE_PROJECT_ID',
  storageBucket: 'VOTRE_PROJECT.appspot.com',
  messagingSenderId: 'VOTRE_SENDER_ID',
  appId: 'VOTRE_APP_ID',
};

// ─── FIRESTORE COLLECTIONS ────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  CARS: 'cars',
  OPERATIONS: 'operations',
  DOCUMENTS: 'documents',
};

// ─── SERVICE FIREBASE ─────────────────────────────────────────────────────────
// src/utils/firebaseService.js
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

export const getUID = () => auth().currentUser?.uid;

// ── Voitures ──────────────────────────────────────────────────────────────────
export const carsCollection = () =>
  firestore()
    .collection(COLLECTIONS.CARS)
    .where('userId', '==', getUID());

export const subscribeToCars = (callback) =>
  carsCollection().orderBy('createdAt', 'desc').onSnapshot((snap) => {
    const cars = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(cars);
  });

export const addCar = async (carData) => {
  const uid = getUID();
  return firestore().collection(COLLECTIONS.CARS).add({
    ...carData,
    userId: uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const updateCar = async (carId, data) =>
  firestore()
    .collection(COLLECTIONS.CARS)
    .doc(carId)
    .update({ ...data, updatedAt: firestore.FieldValue.serverTimestamp() });

export const deleteCar = async (carId) =>
  firestore().collection(COLLECTIONS.CARS).doc(carId).delete();

export const archiveCar = async (carId) =>
  updateCar(carId, { archived: true });

// ── Opérations ────────────────────────────────────────────────────────────────
export const subscribeToOps = (carId, callback) =>
  firestore()
    .collection(COLLECTIONS.OPERATIONS)
    .where('carId', '==', carId)
    .where('userId', '==', getUID())
    .orderBy('date', 'desc')
    .onSnapshot((snap) => {
      const ops = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(ops);
    });

export const addOperation = async (opData) => {
  const uid = getUID();
  return firestore().collection(COLLECTIONS.OPERATIONS).add({
    ...opData,
    userId: uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteOperation = async (opId) =>
  firestore().collection(COLLECTIONS.OPERATIONS).doc(opId).delete();

// ── Documents / Photos ────────────────────────────────────────────────────────
export const uploadDocument = async (uri, path) => {
  const ref = storage().ref(path);
  await ref.putFile(uri);
  return ref.getDownloadURL();
};

export const deleteDocument = async (path) =>
  storage().ref(path).delete();

// ── Profil utilisateur ────────────────────────────────────────────────────────
export const saveUserProfile = async (uid, profile) =>
  firestore().collection(COLLECTIONS.USERS).doc(uid).set(profile, { merge: true });

export const getUserProfile = async (uid) => {
  const doc = await firestore().collection(COLLECTIONS.USERS).doc(uid).get();
  return doc.exists ? doc.data() : null;
};
