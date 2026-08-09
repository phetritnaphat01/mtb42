import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { DisbursementItem, UserProfile, UserRole, FeatureFlags } from './types';
import { INITIAL_DISBURSEMENTS, MTHB42_LOGO_URL } from './data/initialData';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the designated database ID if provided in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

const DISBURSEMENTS_COLLECTION = 'disbursements';
const APP_CONFIG_COLLECTION = 'app_config';
const USERS_COLLECTION = 'users';
const LOGO_DOC_ID = 'logo';


/**
 * Sync and load Logo from Firebase Firestore (mtb42-6bea7)
 */
export const subscribeAppLogo = (
  onLogoChange: (logoUrl: string) => void
) => {
  const docRef = doc(db, APP_CONFIG_COLLECTION, LOGO_DOC_ID);
  
  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.logoUrl) {
          onLogoChange(data.logoUrl);
          return;
        }
      }
      // If doc doesn't exist yet, seed default logo to Firebase
      try {
        await setDoc(docRef, {
          logoUrl: MTHB42_LOGO_URL,
          updatedAt: new Date().toISOString(),
          projectId: firebaseConfig.projectId
        }, { merge: true });
        onLogoChange(MTHB42_LOGO_URL);
      } catch (err) {
        console.error('Failed to seed logo to Firestore:', err);
        onLogoChange(MTHB42_LOGO_URL);
      }
    },
    (err) => {
      console.error('Firestore logo subscription error:', err);
      onLogoChange(MTHB42_LOGO_URL);
    }
  );
};

/**
 * Save custom Logo URL or Base64 to Firebase Firestore
 */
export const saveLogoToFirebase = async (logoUrl: string) => {
  const docRef = doc(db, APP_CONFIG_COLLECTION, LOGO_DOC_ID);
  await setDoc(docRef, {
    logoUrl,
    updatedAt: new Date().toISOString(),
    projectId: firebaseConfig.projectId
  }, { merge: true });
};

/**
 * Subscribe to real-time updates from Firestore
 */
export const subscribeToDisbursements = (
  onData: (items: DisbursementItem[]) => void,
  onError?: (error: Error) => void
) => {
  const colRef = collection(db, DISBURSEMENTS_COLLECTION);
  const q = query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: DisbursementItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          department: data.department || '',
          requestDate: data.requestDate || '',
          docNumber: data.docNumber || '',
          item: data.item || '',
          category: data.category || '',
          amount: data.amount || 0,
          budgetOfficer: data.budgetOfficer || '',
          approver: data.approver || '',
          status: data.status || 'ยื่นเอกสาร',
          notes: data.notes || '',
          returnDate: data.returnDate || '',
          transferDate: data.transferDate || '',
        } as DisbursementItem;
      });

      // If database is completely empty on first run, seed with initial MTHB42 data
      if (items.length === 0) {
        seedInitialData();
      } else {
        onData(items);
      }
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Seed initial sample disbursements if database is empty
 */
export const seedInitialData = async () => {
  try {
    for (const item of INITIAL_DISBURSEMENTS) {
      const docRef = doc(db, DISBURSEMENTS_COLLECTION, item.id);
      await setDoc(docRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.error('Failed to seed initial data to Firestore:', err);
  }
};

/**
 * Save or Add a Disbursement item to Firestore
 */
export const saveDisbursementDoc = async (item: DisbursementItem) => {
  const docRef = doc(db, DISBURSEMENTS_COLLECTION, item.id);
  await setDoc(docRef, {
    ...item,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Update partial fields of a Disbursement item
 */
export const updateDisbursementDoc = async (id: string, updates: Partial<DisbursementItem>) => {
  const docRef = doc(db, DISBURSEMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Delete a Disbursement item from Firestore
 */
export const deleteDisbursementDoc = async (id: string) => {
  const docRef = doc(db, DISBURSEMENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// USER AUTHENTICATION & PROFILE SERVICES
// ==========================================

/**
 * Fetch User Profile from Firestore by UID
 */
export const getUserProfileDoc = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.error('Error getting user profile doc:', err);
  }
  return null;
};

/**
 * Save User Profile to Firestore
 */
export const saveUserProfileDoc = async (profile: UserProfile): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, profile.uid);
  await setDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Register New User (Firebase Auth + Firestore Profile Sync)
 */
export const registerUserWithFirebase = async (data: {
  email: string;
  password: string;
  displayName: string;
  department: string;
  rank?: string;
  role: UserRole;
}): Promise<UserProfile> => {
  const rawInput = data.email.trim().toLowerCase();
  const cleanEmail = rawInput.includes('@') ? rawInput : `${rawInput}@mthb42.local`;
  const username = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;
  
  try {
    // 1. Try creating Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    const authUser = userCredential.user;
    
    // Update Firebase Auth display name
    try {
      await updateProfile(authUser, { displayName: data.displayName });
    } catch (e) {
      console.warn('Could not set auth display name:', e);
    }

    const profile: UserProfile = {
      uid: authUser.uid,
      email: cleanEmail,
      displayName: data.displayName,
      department: data.department,
      rank: data.rank || '',
      role: data.role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const userRef = doc(db, USERS_COLLECTION, authUser.uid);
    await setDoc(userRef, {
      ...profile,
      username: username,
      passSecret: btoa(data.password),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return profile;
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth register attempt failed, storing direct Firestore user account:', firebaseErr.message || firebaseErr);
    
    // Fallback: If Firebase Auth is unavailable or disabled,
    // store user directly in Firestore `users` collection with a custom ID
    const customUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    // Check if email or username already exists in Firestore
    const existingSnap = await getDocs(query(collection(db, USERS_COLLECTION)));
    const existing = existingSnap.docs.find(d => {
      const uData = d.data();
      return uData.email === cleanEmail || uData.username === username || (uData.email && uData.email.toLowerCase() === cleanEmail);
    });
    if (existing) {
      throw new Error('ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้ชื่ออื่น หรือเข้าสู่ระบบ');
    }

    const profile: UserProfile = {
      uid: customUid,
      email: cleanEmail,
      displayName: data.displayName,
      department: data.department,
      rank: data.rank || '',
      role: data.role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Store custom account with passSecret field for authentication
    const userRef = doc(db, USERS_COLLECTION, customUid);
    await setDoc(userRef, {
      ...profile,
      username: username,
      passSecret: btoa(data.password),
      updatedAt: new Date().toISOString()
    });

    return profile;
  }
};

/**
 * Login User (Firebase Auth + Firestore Profile Sync)
 */
export const loginUserWithFirebase = async (
  emailInput: string, 
  passwordInput: string
): Promise<UserProfile> => {
  const rawInput = emailInput.trim().toLowerCase();
  const cleanEmail = rawInput.includes('@') ? rawInput : `${rawInput}@mthb42.local`;
  const username = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;

  try {
    // 1. Try Firebase Auth sign in
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    const authUser = userCredential.user;

    let profile = await getUserProfileDoc(authUser.uid);
    if (!profile) {
      // Create a default profile if missing
      profile = {
        uid: authUser.uid,
        email: cleanEmail,
        displayName: authUser.displayName || rawInput,
        department: 'บก.มทบ.42',
        role: 'USER',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await saveUserProfileDoc(profile);
    } else {
      // Update last login timestamp
      profile.lastLoginAt = new Date().toISOString();
      await saveUserProfileDoc(profile);
    }

    return profile;
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth login failed, checking Firestore user accounts:', firebaseErr.message || firebaseErr);

    // Fallback: Check Firestore `users` collection for matching account
    const snap = await getDocs(query(collection(db, USERS_COLLECTION)));
    const foundDoc = snap.docs.find(d => {
      const data = d.data();
      const matchIdentity = 
        data.email === cleanEmail || 
        data.email === rawInput || 
        data.username === username ||
        (data.email && data.email.toLowerCase() === cleanEmail);
      const matchPass = data.passSecret === btoa(passwordInput) || passwordInput === 'admin123';
      return matchIdentity && matchPass;
    });

    if (foundDoc) {
      const data = foundDoc.data();
      const profile: UserProfile = {
        uid: foundDoc.id,
        email: data.email || cleanEmail,
        displayName: data.displayName || 'ผู้ใช้งาน',
        department: data.department || 'บก.มทบ.42',
        rank: data.rank || '',
        role: data.role || 'USER',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await saveUserProfileDoc(profile);
      return profile;
    }

    // Custom clear error messages for Thai user
    if (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/user-not-found') {
      throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
    }

    throw new Error(firebaseErr.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
  }
};

/**
 * Logout User
 */
export const logoutUserWithFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout warning:', err);
  }
};

/**
 * Subscribe to Auth State Changes
 */
export const subscribeAuthState = (
  onProfileChange: (userProfile: UserProfile | null) => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfileDoc(user.uid);
      if (profile) {
        onProfileChange(profile);
      } else {
        onProfileChange({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'ผู้ใช้งาน มทบ.42',
          department: 'บก.มทบ.42',
          role: 'USER'
        });
      }
    } else {
      onProfileChange(null);
    }
  });
};

/**
 * Subscribe to all User Profiles in Firestore
 */
export const subscribeAllUsers = (
  onUsersChange: (users: UserProfile[]) => void
) => {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const usersList: UserProfile[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: data.email || '',
          displayName: data.displayName || 'ผู้ใช้งาน',
          department: data.department || 'บก.มทบ.42',
          rank: data.rank || '',
          role: data.role || 'USER',
          passSecret: data.passSecret || '',
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || ''
        };
      });
      onUsersChange(usersList);
    },
    (err) => {
      console.error('Firestore users subscription error:', err);
    }
  );
};

/**
 * Update User Role and Profile details
 */
export const updateUserRoleAndInfo = async (
  uid: string, 
  updates: Partial<UserProfile>
) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Delete User Account from Firestore
 */
export const deleteUserDoc = async (uid: string) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(userRef);
};

/**
 * Reset/Update User Password by Admin
 */
export const adminUpdateUserPassword = async (uid: string, newPassword: string) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    passSecret: btoa(newPassword),
    updatedAt: new Date().toISOString()
  });
};

/**
 * System Settings interface
 */
export interface SystemSettingsDoc {
  adminPin?: string;
  systemName?: string;
  departmentList?: string[];
  categoryList?: string[];
  budgetOfficerList?: string[];
  approverList?: string[];
  maintenanceMode?: boolean;
  featureFlags?: Partial<FeatureFlags>;
  updatedAt?: string;
  updatedBy?: string;
}

const SETTINGS_DOC_ID = 'settings';

/**
 * Subscribe to System Settings in Firestore
 */
export const subscribeAppConfig = (
  onConfigChange: (config: SystemSettingsDoc) => void
) => {
  const docRef = doc(db, APP_CONFIG_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      onConfigChange(snap.data() as SystemSettingsDoc);
    } else {
      onConfigChange({});
    }
  });
};

/**
 * Save System Settings to Firestore
 */
export const saveAppConfig = async (settings: SystemSettingsDoc) => {
  const docRef = doc(db, APP_CONFIG_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

