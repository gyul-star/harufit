import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { UserProfile } from '../types';
import { getUserProfile, saveUserProfile } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isNicknameModalOpen: boolean;
  setIsNicknameModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isNicknameModalOpen: false,
  setIsNicknameModalOpen: () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  updateNickname: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile && profile.displayName) {
            setUserProfile(profile);
          } else {
            // New user without nickname set
            const newProf: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL,
              createdAt: new Date().toISOString()
            };
            if (!newProf.displayName) {
              setIsNicknameModalOpen(true);
            } else {
              await saveUserProfile(newProf);
            }
            setUserProfile(newProf);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      } else {
        setUserProfile(null);
        setIsNicknameModalOpen(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      const existingProfile = await getUserProfile(currentUser.uid);
      if (!existingProfile || !existingProfile.displayName) {
        const defaultName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
        const newProf: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: defaultName,
          photoURL: currentUser.photoURL,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(newProf);
        setUserProfile(newProf);
        // Prompt nickname modal if name is placeholder or needs review
        if (!currentUser.displayName) {
          setIsNicknameModalOpen(true);
        }
      } else {
        setUserProfile(existingProfile);
      }
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', error);
        throw error;
      }
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsNicknameModalOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user) return;
    const trimmed = newNickname.trim();
    if (!trimmed) return;

    const updatedProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: trimmed,
      photoURL: user.photoURL,
      updatedAt: new Date().toISOString()
    };
    await saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
    setIsNicknameModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isNicknameModalOpen,
        setIsNicknameModalOpen,
        signInWithGoogle,
        signOutUser,
        updateNickname
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
