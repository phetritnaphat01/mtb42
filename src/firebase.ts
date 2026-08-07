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
import { DisbursementItem } from './types';
import { INITIAL_DISBURSEMENTS, MTHB42_LOGO_URL } from './data/initialData';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the designated database ID if provided in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const DISBURSEMENTS_COLLECTION = 'disbursements';
const APP_CONFIG_COLLECTION = 'app_config';
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
