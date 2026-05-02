// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { saveUserProfile, getUserProfile } from '../utils/firebase';

// ⚠️ Remplacez par votre Web Client ID Firebase
const WEB_CLIENT_ID = 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com';

GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p || {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Utilisateur',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const result = await auth().signInWithCredential(credential);
      const u = result.user;
      const existingProfile = await getUserProfile(u.uid);
      const profileData = existingProfile || {
        uid: u.uid,
        name: u.displayName || 'Utilisateur',
        email: u.email,
        photoURL: u.photoURL,
        createdAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
      };
      await saveUserProfile(u.uid, profileData);
      setProfile(profileData);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Connexion annulée');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Connexion en cours');
      } else {
        throw error;
      }
    }
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  const updateProfile = async (data) => {
    const updated = { ...profile, ...data, lastSync: new Date().toISOString() };
    await saveUserProfile(user.uid, updated);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
