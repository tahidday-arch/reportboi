import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Drawer } from './components/Drawer';
import { BottomNav } from './components/BottomNav';
import { HomeCategories } from './components/HomeCategories';
import { ReportSection } from './components/ReportSection';
import { CategoryDetailView } from './components/CategoryDetailView';
import { ReportPDFView } from './components/ReportPDFView';
import { AboutShibirView } from './components/AboutShibirView';
import { AuthModal } from './components/AuthModal';
import { InstallAppModal } from './components/InstallAppModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ActiveScreen, CategoryId, ReportRecord } from './types';
import { loadSavedReports, saveSingleReport, loadUserProfile, saveUserProfile, UserProfileData } from './utils/storage';
import { Check, Clock, Cloud } from 'lucide-react';
import { auth, onAuthStateChanged, FirebaseUser } from './firebase';
import {
  syncUserProfileToFirestore,
  loadUserProfileFromFirestore,
  syncReportToFirestore,
  loadReportsFromFirestore,
  syncNotesToFirestore,
  loadNotesFromFirestore,
} from './services/firestoreSync';

const NOTES_STORAGE_KEY = 'bekti_report_personal_notes_v1';
const USER_PIC_STORAGE_KEY = 'bekti_report_user_profile_pic_v1';
const DEFAULT_NOTES = '';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('report');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('personal_info');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const { isInstalled, isInstallable, install } = usePWAInstall();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [savedReports, setSavedReports] = useState<ReportRecord[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportRecord | null>(null);
  const [pdfPreviewReport, setPdfPreviewReport] = useState<ReportRecord | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);

  // Debounce timer refs for instant auto-save to cloud
  const reportSyncTimerRef = React.useRef<any>(null);
  const notesSyncTimerRef = React.useRef<any>(null);

  // User Profile state (loaded from and saved to localStorage, synced to Firestore)
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => loadUserProfile());

  // Persistent User Profile Picture state
  const [profileImage, setProfileImage] = useState<string>(() => {
    try {
      return localStorage.getItem(USER_PIC_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Auto-saved notes with timestamp in localStorage
  const [notesText, setNotesText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      return saved !== null ? saved : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('ক্লাউড ডাটাবেজের সাথে সিঙ্ক হচ্ছে...');
        try {
          // 1. Load or sync user profile
          const cloudProfileData = await loadUserProfileFromFirestore(user.uid);
          if (cloudProfileData && cloudProfileData.profile) {
            setUserProfile(cloudProfileData.profile);
            saveUserProfile(cloudProfileData.profile);
            if (cloudProfileData.profileImage) {
              setProfileImage(cloudProfileData.profileImage);
              localStorage.setItem(USER_PIC_STORAGE_KEY, cloudProfileData.profileImage);
            }
          } else {
            // First time login: initialize with user's name/photo from Google if empty
            const initialProfile: UserProfileData = {
              ...userProfile,
              name: userProfile.name || user.displayName || '',
            };
            const initialPic = profileImage || user.photoURL || '';
            setUserProfile(initialProfile);
            saveUserProfile(initialProfile);
            if (initialPic) {
              setProfileImage(initialPic);
              localStorage.setItem(USER_PIC_STORAGE_KEY, initialPic);
            }
            await syncUserProfileToFirestore(user.uid, initialProfile, initialPic);
          }

          // 2. Load or sync reports
          const cloudReports = await loadReportsFromFirestore(user.uid);
          if (cloudReports.length > 0) {
            setSavedReports(cloudReports);
            setCurrentReport(cloudReports[0]);
          } else {
            // Push any existing local reports to cloud
            const localReports = loadSavedReports();
            for (const rep of localReports) {
              await syncReportToFirestore(user.uid, rep);
            }
          }

          // 3. Load or sync notes
          const cloudNotes = await loadNotesFromFirestore(user.uid);
          if (cloudNotes && cloudNotes.notesText) {
            setNotesText(cloudNotes.notesText);
            setLastSavedTimestamp(cloudNotes.lastSavedTimestamp || '');
            localStorage.setItem(NOTES_STORAGE_KEY, cloudNotes.notesText);
          } else if (notesText) {
            await syncNotesToFirestore(user.uid, notesText, lastSavedTimestamp);
          }

          setCloudSyncStatus('ক্লাউড ডাটাবেজ সংযুক্ত ও সম্পূর্ণ সুরক্ষিত');
          setTimeout(() => setCloudSyncStatus(null), 3000);
        } catch (error) {
          console.error('Cloud sync error:', error);
          setCloudSyncStatus(null);
        }
      } else {
        setCloudSyncStatus(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update profile and persist
  const handleUpdateUserProfile = (updated: UserProfileData) => {
    setUserProfile(updated);
    saveUserProfile(updated);
    if (currentUser) {
      syncUserProfileToFirestore(currentUser.uid, updated, profileImage).catch(console.error);
    }
  };

  // Update profile image and persist
  const handleUpdateProfileImage = (base64: string) => {
    setProfileImage(base64);
    try {
      if (base64) {
        localStorage.setItem(USER_PIC_STORAGE_KEY, base64);
      } else {
        localStorage.removeItem(USER_PIC_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to store profile image:', err);
    }

    if (currentUser) {
      syncUserProfileToFirestore(currentUser.uid, userProfile, base64).catch(console.error);
    }
  };

  // Save notes whenever user types (instant local save + debounced cloud sync)
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNotesText(text);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTimestamp(timeStr);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, text);
    } catch (err) {
      console.error('Failed to auto-save notes:', err);
    }

    if (currentUser) {
      if (notesSyncTimerRef.current) clearTimeout(notesSyncTimerRef.current);
      notesSyncTimerRef.current = setTimeout(() => {
        syncNotesToFirestore(currentUser.uid, text, timeStr).catch(console.error);
      }, 400);
    }
  };

  // Initialize reports from local storage on mount
  useEffect(() => {
    const loaded = loadSavedReports();
    setSavedReports(loaded);
    if (loaded.length > 0) {
      setCurrentReport(loaded[0]);
    }
  }, []);

  const handleUpdateCurrentReport = (updated: ReportRecord) => {
    setCurrentReport(updated);
    setSavedReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    // Instant local auto-save
    saveSingleReport(updated);

    // Fast debounced cloud auto-save
    if (currentUser) {
      if (reportSyncTimerRef.current) clearTimeout(reportSyncTimerRef.current);
      reportSyncTimerRef.current = setTimeout(() => {
        syncReportToFirestore(currentUser.uid, updated).catch(console.error);
      }, 400);
    }
  };

  const handleSelectReport = (rep: ReportRecord) => {
    setCurrentReport(rep);
    setActiveScreen('report');
  };

  const handleOpenPDF = (rep: ReportRecord) => {
    setPdfPreviewReport(rep);
  };

  const currentUserName = userProfile.name?.trim() || currentUser?.displayName || 'ব্যবহারকারী';
  const currentUserSubtitle = userProfile.subtitle?.trim() || 'ব্যক্তিগত তথ্য বিবরণী';

  // Full Screen Printable PDF View
  if (pdfPreviewReport) {
    return (
      <ReportPDFView
        report={pdfPreviewReport}
        onBack={() => setPdfPreviewReport(null)}
        userName={currentUserName}
      />
    );
  }

  // Determine current screen title in Bengali
  const getScreenTitle = (screen: ActiveScreen): string => {
    switch (screen) {
      case 'home':
        return 'ব্যক্তিগত রিপোর্ট বই';
      case 'report':
        return 'ব্যক্তিগত রিপোর্ট বই';
      case 'notes':
        return 'ব্যক্তিগত নোটস';
      case 'profile':
        return 'ব্যবহারকারীর প্রোফাইল';
      case 'settings':
        return 'অ্যাপ সেটিংস';
      case 'category_detail':
        return 'বিবরণী তথ্য';
      case 'about_shibir':
        return 'বাংলাদেশ ইসলামী ছাত্রশিবির';
      default:
        return 'ব্যক্তিগত রিপোর্ট বই';
    }
  };

  const handleSelectCategory = (catId: CategoryId) => {
    if (catId === 'view_reports') {
      setActiveScreen('report');
    } else if (catId === 'about_shibir') {
      setActiveScreen('about_shibir');
    } else {
      setSelectedCategory(catId);
      setActiveScreen('category_detail');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl border-x border-slate-200 shadow-xl relative overflow-x-hidden">
      {/* Navigation Top Bar */}
      <Navbar
        title={getScreenTitle(activeScreen)}
        showBack={activeScreen === 'category_detail' || activeScreen === 'about_shibir'}
        onBack={() => setActiveScreen('home')}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSettings={() => setActiveScreen('settings')}
        onOpenProfile={() => setActiveScreen('profile')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isLoggedIn={!!currentUser}
        isInstalled={isInstalled}
        profileImage={profileImage}
        onUpdateProfileImage={handleUpdateProfileImage}
        userName={currentUserName}
      />

      {/* Cloud Sync Toast Notification */}
      {cloudSyncStatus && (
        <div className="bg-emerald-600 text-white px-3 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all">
          <Cloud className="w-3.5 h-3.5 animate-pulse" />
          <span>{cloudSyncStatus}</span>
        </div>
      )}

      {/* Side Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
          setIsDrawerOpen(false);
        }}
        userName={currentUserName}
        profileImage={profileImage}
        isLoggedIn={!!currentUser}
        userEmail={currentUser?.email || undefined}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 pb-20">
        {activeScreen === 'home' && (
          <HomeCategories
            userName={currentUserName}
            userSubtitle={currentUserSubtitle}
            onSelectCategory={handleSelectCategory}
            onNavigate={(screen) => setActiveScreen(screen)}
            isLoggedIn={!!currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
            isInstalled={isInstalled}
          />
        )}

        {activeScreen === 'report' && currentReport && (
          <ReportSection
            currentReport={currentReport}
            onUpdateReport={handleUpdateCurrentReport}
            savedReports={savedReports}
            onSelectReport={handleSelectReport}
            onOpenPDF={handleOpenPDF}
            userName={currentUserName}
          />
        )}

        {activeScreen === 'category_detail' && (
          <CategoryDetailView
            categoryId={selectedCategory}
            onBack={() => setActiveScreen('home')}
            onNavigate={(screen) => setActiveScreen(screen)}
            currentReport={currentReport}
            savedReports={savedReports}
            onSelectReport={handleSelectReport}
            profileImage={profileImage}
            onUpdateProfileImage={handleUpdateProfileImage}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeScreen === 'profile' && (
          <CategoryDetailView
            categoryId="personal_info"
            onBack={() => setActiveScreen('home')}
            onNavigate={(screen) => setActiveScreen(screen)}
            currentReport={currentReport}
            savedReports={savedReports}
            onSelectReport={handleSelectReport}
            profileImage={profileImage}
            onUpdateProfileImage={handleUpdateProfileImage}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeScreen === 'settings' && (
          <CategoryDetailView
            categoryId="settings"
            onBack={() => setActiveScreen('home')}
            onNavigate={(screen) => setActiveScreen(screen)}
            currentReport={currentReport}
            savedReports={savedReports}
            onSelectReport={handleSelectReport}
            profileImage={profileImage}
            onUpdateProfileImage={handleUpdateProfileImage}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeScreen === 'about_shibir' && (
          <AboutShibirView
            onBack={() => setActiveScreen('home')}
            onNavigate={(screen) => setActiveScreen(screen)}
          />
        )}

        {activeScreen === 'notes' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-slate-800">
                দৈনন্দিন আমল ও ব্যক্তিগত নোট
              </h3>
              {lastSavedTimestamp && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>সর্বশেষ সংরক্ষিত: {lastSavedTimestamp}</span>
                </span>
              )}
            </div>

            <textarea
              id="notes-textarea-input"
              rows={9}
              value={notesText}
              onChange={handleNotesChange}
              placeholder="এখানে আপনার ব্যক্তিগত উপলব্ধি, বিশেষ দাওয়াতি পরিকল্পনা বা নোট লিখুন (ক্লাউডে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:bg-white focus:outline-blue-600 leading-relaxed font-medium text-slate-800"
            />

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {currentUser
                  ? 'টাইপ করার সাথে সাথে ক্লাউডে ব্যাকআপ হচ্ছে'
                  : 'টাইপ করার সাথে সাথে স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে'}
              </span>
              <span className="font-semibold text-slate-400 text-[11px]">
                {notesText.length} অক্ষর
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
      />
    </div>
  );
}
