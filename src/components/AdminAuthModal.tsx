import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, Key, Eye, EyeOff, AlertCircle, Info, FolderLock } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onUnlock,
  onLock,
  onChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'unlock' | 'changePass'>('unlock');
  const [passwordInput, setPasswordInput] = useState('');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const success = onUnlock(passwordInput);
    if (success) {
      setPasswordInput('');
      onClose();
    } else {
      setErrorMessage('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง (รหัสผ่านเริ่มต้น: admin123)');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    const success = onChangePassword(oldPasswordInput, newPasswordInput);
    if (success) {
      setOldPasswordInput('');
      setNewPasswordInput('');
      setSuccessMessage('เปลี่ยนรหัสผ่าน Admin เรียบร้อยแล้ว!');
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('unlock');
      }, 2000);
    } else {
      setErrorMessage('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isAdmin 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30' 
            : 'bg-gradient-to-r from-amber-700 via-slate-900 to-slate-950 border-b border-amber-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              isAdmin ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
            }`}>
              {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isAdmin ? 'ระบบจัดการสิทธิ์ Admin' : 'ปลดล็อกสิทธิ์ Admin (ผู้ดูแลระบบ)'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAdmin ? 'สถานะปัจจุบัน: ปลดล็อกโหมดแก้ไขได้' : 'สถานะปัจจุบัน: ผู้ใช้ทั่วไป (อ่านอย่างเดียว - Read-Only)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">

          {/* Current Mode Badge Banner */}
          {isAdmin ? (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Unlock className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">กำลังใช้งานในสิทธิ์ Admin</div>
                  <div className="text-[11px] text-emerald-700">สามารถเพิ่ม แก้ไข ลบ และเปลี่ยนสถานะเอกสารได้</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onLock();
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow transition flex items-center gap-1 shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ล็อกสิทธิ์</span>
              </button>
            </div>
          ) : (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5">
              <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">โหมดปัจจุบัน: อ่านอย่างเดียว (Read-Only)</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  ผู้ใช้ทั่วไปสามารถดูข้อมูลและพิมพ์ใบฎีกาได้ แต่ไม่สามารถแก้ไข ลบ หรือเพิ่มรายการได้ หากต้องการแก้ไขโปรดใส่รหัสผ่านเพื่อปลดล็อก
                </p>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => { setActiveTab('unlock'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`pb-2.5 px-4 font-semibold text-xs transition border-b-2 ${
                activeTab === 'unlock'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {isAdmin ? 'ยืนยันรหัสผ่าน' : 'ใส่รหัสผ่าน Admin'}
            </button>
            <button
              onClick={() => { setActiveTab('changePass'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`pb-2.5 px-4 font-semibold text-xs transition border-b-2 ${
                activeTab === 'changePass'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              เปลี่ยนรหัสผ่าน Admin
            </button>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Tab 1: Unlock */}
          {activeTab === 'unlock' && (
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รหัสผ่านผู้ดูแลระบบ (Admin Password / PIN)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="ใส่รหัสผ่าน Admin (เริ่มต้น: admin123)"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    autoFocus
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  รหัสผ่านเริ่มต้นสำหรับทดสอบ: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">admin123</code>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>ปลดล็อก Admin</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Tab 2: Change Password */}
          {activeTab === 'changePass' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านเดิม
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="รหัสผ่านปัจจุบัน (เช่น admin123)"
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="ตั้งรหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร"
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>บันทึกรหัสผ่านใหม่</span>
                </button>
              </div>
            </form>
          )}

          {/* Extra Info Box: Folder Read-Only Setup Guide */}
          <div className="mt-6 pt-4 border-t border-slate-200 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <div className="flex items-start space-x-2 text-slate-700 text-xs">
              <FolderLock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">คำแนะนำตั้งค่าโฟลเดอร์เอกสารปลายทาง (Google Drive):</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  เพื่อป้องกันผู้ใช้ทั่วไปแก้ไขเอกสารในระบบคลาวด์ ให้ไปที่โฟลเดอร์ใน Google Drive &rarr; แชร์ (Share) &rarr; ตั้งค่าสิทธิ์ของสมาชิกรวม หรือทุกคนที่มีลิงก์ให้เป็น <span className="font-semibold text-amber-800">"ผู้ดู" (Viewer / Read-Only)</span> เพื่อให้อ่านเอกสารได้อย่างเดียว
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
