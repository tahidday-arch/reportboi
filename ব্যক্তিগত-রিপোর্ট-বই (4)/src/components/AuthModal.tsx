import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Cloud,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  firebaseSignOut,
  FirebaseUser,
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onAuthSuccess?: (user: FirebaseUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      onClose();
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('লগইন পপআপটি বন্ধ করা হয়েছে। আবার চেষ্টা করুন।');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('অনুরোধটি বাতিল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } else {
        setErrorMessage(error?.message || 'গুগল দিয়ে লগইন করতে সমস্যা হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('অনুগ্রহ করে সঠিক ইমেইল অ্যাড্রেস লিখুন।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        // Create new account
        const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (name.trim() && userCred.user) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
        setSuccessMessage('নতুন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        if (userCred.user && onAuthSuccess) {
          onAuthSuccess(userCred.user);
        }
        setTimeout(() => onClose(), 800);
      } else {
        // Sign in with existing credentials
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        setSuccessMessage('সফলভাবে লগইন হয়েছে!');
        if (userCred.user && onAuthSuccess) {
          onAuthSuccess(userCred.user);
        }
        setTimeout(() => onClose(), 800);
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      const code = error?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে। লগইন ট্যাব ব্যবহার করুন।');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('ইমেইল ফরম্যাট সঠিক নয়।');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('পাসওয়ার্ডটি দুর্বল। আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।');
      } else {
        setErrorMessage(error?.message || 'লগইন করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      onClose();
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setErrorMessage('লগআউট করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          // Signed-in State View
          <div className="text-center space-y-4 pt-2">
            <div className="w-16 h-16 rounded-2xl mx-auto overflow-hidden border-2 border-emerald-500 shadow-md relative group">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'ইউজার'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xl">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cloud className="w-3 h-3" /> ক্লাউড ডাটাবেজ সংযুক্ত
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {currentUser.displayName || 'ব্যবহারকারী'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>রিপোর্ট বই ও ব্যক্তিগত তথ্য ক্লাউডে সম্পূর্ণ সুরক্ষিত</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>লগআউট করুন</span>
            </button>
          </div>
        ) : (
          // Signed-out State View (Login & Register Options)
          <div className="space-y-4 pt-1">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 mx-auto flex items-center justify-center shadow-xs">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {isRegisterMode ? 'নতুন অ্যাকাউন্ট খুলুন' : 'অ্যাকাউন্টে লগইন করুন'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                আপনার রিপোর্ট বই ও ব্যক্তিগত তথ্য নিরাপদে ক্লাউডে সংরক্ষণ করতে লগইন করুন
              </p>
            </div>

            {/* Method Tabs: Google vs Email */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  authMethod === 'google'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                গুগল সাইন-ইন
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ইমেইল / পাসওয়ার্ড
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {authMethod === 'google' ? (
              // Google Login Option
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5 text-left bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>১-ক্লিকে ঝামেলাহীন গুগল অথেনটিকেশন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>যেকোনো ডিভাইস থেকে নিরাপদে ডেটা অ্যাক্সেস</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>মাসিক রিপোর্ট ও ব্যক্তিগত নোটস ক্লাউড ব্যাকআপ</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>গুগল দিয়ে সাইন-ইন করুন</span>
                </button>
              </div>
            ) : (
              // Email / Password Form Option
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                {isRegisterMode && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      আপনার নাম:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-blue-600 text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ইমেইল অ্যাড্রেস:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="example@mail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-blue-600 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    পাসওয়ার্ড:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      required
                      placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs focus:bg-white focus:outline-blue-600 text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 mt-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>{isRegisterMode ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}</span>
                </button>

                {/* Switch between Login and Register */}
                <div className="text-center pt-1 border-t border-slate-100">
                  {isRegisterMode ? (
                    <p className="text-[11px] text-slate-500">
                      ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setErrorMessage(null);
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        লগইন করুন
                      </button>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      অ্যাকাউন্ট নেই?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(true);
                          setErrorMessage(null);
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        নতুন অ্যাকাউন্ট খুলুন
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
