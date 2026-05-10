import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from './AuthContextCore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (!auth) {
      console.error("Firebase Auth not initialized correctly. Check your configuration.");
      // Use setTimeout to avoid cascading renders warning in effect
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          unsubscribeFirestore = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.data());
            }
            setLoading(false);
          }, (error) => {
            console.error("Firestore sync error:", error);
            setLoading(false);
          });
        } catch (error) {
          console.error("Firestore setup error:", error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth listener error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, userData, login, signup, logout, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
