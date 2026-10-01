import { db, doc, getDoc, setDoc, collection, getDocs } from '../firebase';
import { UserProfileData } from '../utils/storage';
import { ReportRecord } from '../types';

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfileToFirestore(
  userId: string,
  profile: UserProfileData,
  profileImage?: string
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        ...profile,
        userId,
        profileImage: profileImage || profile.avatar || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving profile to Firestore:', error);
    throw error;
  }
}

/**
 * Load user profile from Firestore
 */
export async function loadUserProfileFromFirestore(
  userId: string
): Promise<{ profile: UserProfileData; profileImage?: string } | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const profileImage = data.profileImage || '';
      return {
        profile: data as UserProfileData,
        profileImage,
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading profile from Firestore:', error);
    return null;
  }
}

/**
 * Save monthly report to Firestore
 */
export async function syncReportToFirestore(
  userId: string,
  report: ReportRecord
): Promise<void> {
  try {
    // Generate valid safe document ID (letters, numbers, underscores, hyphens)
    const safeReportId = `rep_${encodeURIComponent(report.year)}_${encodeURIComponent(report.month)}`.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const reportDocRef = doc(db, 'users', userId, 'reports', safeReportId);
    await setDoc(
      reportDocRef,
      {
        ...report,
        userId,
        reportDocId: safeReportId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
  }
}

/**
 * Load all saved reports from Firestore for a user
 */
export async function loadReportsFromFirestore(
  userId: string
): Promise<ReportRecord[]> {
  try {
    const reportsCollectionRef = collection(db, 'users', userId, 'reports');
    const querySnapshot = await getDocs(reportsCollectionRef);
    const reports: ReportRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push(data as ReportRecord);
    });
    return reports;
  } catch (error) {
    console.error('Error loading reports from Firestore:', error);
    return [];
  }
}

/**
 * Save personal notes to Firestore
 */
export async function syncNotesToFirestore(
  userId: string,
  notesText: string,
  lastSavedTimestamp: string
): Promise<void> {
  try {
    const notesDocRef = doc(db, 'users', userId, 'notes', 'main_notes');
    await setDoc(
      notesDocRef,
      {
        userId,
        notesText,
        lastSavedTimestamp,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving notes to Firestore:', error);
  }
}

/**
 * Load personal notes from Firestore
 */
export async function loadNotesFromFirestore(
  userId: string
): Promise<{ notesText: string; lastSavedTimestamp: string } | null> {
  try {
    const notesDocRef = doc(db, 'users', userId, 'notes', 'main_notes');
    const snap = await getDoc(notesDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        notesText: data.notesText || '',
        lastSavedTimestamp: data.lastSavedTimestamp || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading notes from Firestore:', error);
    return null;
  }
}
