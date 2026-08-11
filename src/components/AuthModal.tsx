import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  User, 
  Building2, 
  Mail, 
  Sparkles,
  CheckCircle2,
  Award,
  Loader2
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { loginUserWithFirebase, registerUserWithFirebase } from '../firebase';
import { MTHB42_LOGO_URL } from '../data/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  initialTab?: 'login' | 'register';
  adminPassword?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'login',
  adminPassword
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Login State
  const [rememberUsername, setRememberUsername] = useState<boolean>(() => {
    return localStorage.getItem('mthb42_remember_flag') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState<string>(() => {
    return localStorage.getItem('mthb42_remembered_username') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [rank, setRank] = useState('พ.อ.');
  const [customRank, setCustomRank] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('บก.มทบ.42');
  const [customDepartment, setCustomDepartment] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [adminPinInput, setAdminPinInput] = useState('admin123');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);

  const effectiveAdminPass = (adminPassword || localStorage.getItem('mthb42_admin_pass') || 'admin123').trim();

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail || !loginPassword) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    try {
      if (rememberUsername) {
        localStorage.setItem('mthb42_remembered_username', loginEmail.trim());
        localStorage.setItem('mthb42_remember_flag', 'true');
      } else {
        localStorage.removeItem('mthb42_remembered_username');
        localStorage.setItem('mthb42_remember_flag', 'false');
      }

      const profile = await loginUserWithFirebase(loginEmail, loginPassword);
      setSuccessMessage(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${profile.displayName}`);
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (targetRole: 'ADMIN' | 'USER') => {
    setErrorMessage(null);
    setIsLoading(true);

    const demoEmail = targetRole === 'ADMIN' ? 'admin.mthb42@mil.th' : 'user.mthb42@mil.th';
    const demoPassword = 'admin123';
    const demoName = targetRole === 'ADMIN' ? 'พ.อ. ผู้ดูแลระบบ มทบ.42' : 'ส.อ. สมชาย เบิกจ่าย';
    const demoDept = targetRole === 'ADMIN' ? 'ฝ่ายงบประมาณ มทบ.42' : 'บก.มทบ.42';

    try {
      let profile: UserProfile;
      try {
        profile = await loginUserWithFirebase(demoEmail, demoPassword);
      } catch (err) {
        // If demo account doesn't exist yet, create it
        profile = await registerUserWithFirebase({
          email: demoEmail,
          password: demoPassword,
          displayName: demoName,
          department: demoDept,
          rank: targetRole === 'ADMIN' ? 'พ.อ.' : 'ส.อ.',
          role: targetRole
        });
      }

      setSuccessMessage(`เข้าสู่ระบบสาธิต (${targetRole}) เรียบร้อยแล้ว`);
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage('ไม่สามารถสร้างบัญชีสาธิตได้: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const finalRank = rank === 'OTHER' ? customRank : rank;
    const finalDepartment = department === 'OTHER' ? customDepartment : department;
    const fullNameWithRank = `${finalRank} ${displayName}`.trim();

    if (!displayName || !regEmail || !regPassword) {
      setErrorMessage('กรุณากรอกข้อมูลสำคัญ (ชื่อ-นามสกุล, อีเมล, รหัสผ่าน) ให้ครบถ้วน');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const cleanPinInput = adminPinInput.trim();
    if (role === 'ADMIN' && cleanPinInput !== effectiveAdminPass && cleanPinInput !== 'admin123') {
      setErrorMessage(`รหัสผ่านยืนยันสิทธิ์ Admin (PIN) ไม่ถูกต้อง (รหัสผ่านตั้งต้นคือ: admin123)`);
      return;
    }

    setIsLoading(true);
    try {
      const profile = await registerUserWithFirebase({
        email: regEmail,
        password: regPassword,
        displayName: fullNameWithRank,
        department: finalDepartment,
        rank: finalRank,
        role: role
      });

      setSuccessMessage('สมัครสมาชิกเข้าระบบสำเร็จแล้ว!');
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition"
          >
            ✕
          </button>

          <div className="flex items-center space-x-4">
            <img 
              src={MTHB42_LOGO_URL} 
              alt="มทบ.42" 
              className="w-14 h-14 object-contain filter drop-shadow-md bg-white/10 p-1 rounded-2xl border border-amber-400/30" 
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>มณฑลทหารบกที่ ๔๒ (มทบ.42)</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                ระบบสมาชิกเบิกจ่ายงบประมาณ
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                เข้าสู่ระบบหรือสมัครสมาชิกเพื่อบันทึกและจัดการเอกสาร
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl mt-5 border border-slate-700/50">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>สมัครสมาชิกใหม่</span>
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">

          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">เกิดข้อผิดพลาด</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อผู้ใช้ (Username) หรือ อีเมล
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="เช่น officer1, somchai หรือ user.mthb42@mil.th"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="ใส่รหัสผ่านของคุณ"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Username / Email Checkbox */}
              <div className="flex items-center justify-between pt-0.5 pb-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberUsername}
                    onChange={(e) => setRememberUsername(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <span>จำ ชื่อผู้ใช้ (Username) หรือ อีเมล</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-amber-400/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ</span>
                  </>
                )}
              </button>

              {/* Quick Demo Login Option */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-center text-[11px] font-bold text-slate-500 mb-2">
                  หรือ ทดสอบเข้าสู่ระบบแบบรวดเร็ว (Demo)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ADMIN')}
                    disabled={isLoading}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition shadow-sm h-full"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">เข้าสู่ระบบ (Demo Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('USER')}
                    disabled={isLoading}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition shadow-sm h-full"
                  >
                    <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">เข้าสู่ระบบ (Demo User)</span>
                  </button>
                </div>
              </div>


            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Rank & Display Name */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยศ / คำนำหน้า
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    <option value="พ.อ.">พ.อ.</option>
                    <option value="พ.ท.">พ.ท.</option>
                    <option value="พ.ต.">พ.ต.</option>
                    <option value="ร.อ.">ร.อ.</option>
                    <option value="ร.ท.">ร.ท.</option>
                    <option value="ร.ต.">ร.ต.</option>
                    <option value="จ.ส.อ.">จ.ส.อ.</option>
                    <option value="ส.อ.">ส.อ.</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="OTHER">อื่นๆ</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {rank === 'OTHER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ระบุคำนำหน้า / ยศ
                  </label>
                  <input
                    type="text"
                    value={customRank}
                    onChange={(e) => setCustomRank(e.target.value)}
                    placeholder="เช่น ว่าที่ ร.ต."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หน่วยงาน / สังกัด *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                >
                  <option value="บก.มทบ.42">บก.มทบ.42</option>
                  <option value="ฝ่ายงบประมาณ มทบ.42">ฝ่ายงบประมาณ มทบ.42</option>
                  <option value="กรม ทพ.42">กรม ทพ.42</option>
                  <option value="ทน.4">ทน.4</option>
                  <option value="ฝคง.มทบ.42">ฝคง.มทบ.42</option>
                  <option value="ฝกพ.มทบ.42">ฝกพ.มทบ.42</option>
                  <option value="ฝยก.มทบ.42">ฝยก.มทบ.42</option>
                  <option value="ฝกบ.มทบ.42">ฝกบ.มทบ.42</option>
                  <option value="ร้อย.บก.มทบ.42">ร้อย.บก.มทบ.42</option>
                  <option value="OTHER">อื่นๆ (ระบุเอง)</option>
                </select>
              </div>

              {department === 'OTHER' && (
                <div>
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="ระบุชื่อสังกัด / หน่วยงาน"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Email or Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้ (Username) หรือ อีเมล *
                </label>
                <input
                  type="text"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="เช่น officer1, somchai หรือ user@mthb42.go.th"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่าน (6 ตัวขึ้นไป) *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="รหัสผ่าน"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยืนยันรหัสผ่าน *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="ยืนยันรหัสผ่าน"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทสิทธิ์ผู้ใช้งาน (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      role === 'USER'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/50'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div>ผู้ใช้ทั่วไป (User)</div>
                      <div className="text-[10px] font-normal text-slate-500">ยื่นเบิก / ดูข้อมูล</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('ADMIN');
                      if (!adminPinInput) setAdminPinInput(effectiveAdminPass);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      role === 'ADMIN'
                        ? 'bg-slate-900 border-slate-900 text-emerald-300 ring-2 ring-emerald-400/50'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div>ผู้ดูแลระบบ (Admin)</div>
                      <div className="text-[10px] font-normal text-slate-400">อนุมัติ / แก้ไข / ลบ</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Admin Master Key PIN Input when ADMIN role selected */}
              {role === 'ADMIN' && (
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>รหัสผ่านยืนยันสิทธิ์ Admin Master Key *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdminPinInput(effectiveAdminPass)}
                      className="text-[10px] font-bold text-amber-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-700 transition"
                    >
                      เติม PIN อัตโนมัติ ({effectiveAdminPass})
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showAdminPin ? 'text' : 'password'}
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder={`ใส่ PIN Admin (เริ่มต้น: ${effectiveAdminPass})`}
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPin(!showAdminPin)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showAdminPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>สำหรับการสมัครสิทธิ์ Admin กรุณากรอกรหัส PIN ผู้ดูแลระบบ</span>
                    <span className="text-emerald-400 font-semibold">PIN ตั้งต้น: {effectiveAdminPass}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-amber-400/40 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังสมัครสมาชิก...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>สมัครสมาชิกและเริ่มใช้งาน</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
