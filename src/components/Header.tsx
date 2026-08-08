import React from 'react';
import { 
  PlusCircle, 
  RefreshCw, 
  Menu,
  ShieldCheck,
  Lock,
  User,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenAddModal: () => void;
  onExportToDrive?: () => void;
  onRefresh: () => void;
  onOpenMobileMenu?: () => void;
  isGoogleConnected?: boolean;
  isExporting?: boolean;
  isLoading: boolean;
  isAdmin?: boolean;
  onOpenAdminAuthModal?: () => void;
  currentUserProfile?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onRefresh,
  onOpenMobileMenu,
  isLoading,
  isAdmin = false,
  onOpenAdminAuthModal,
  currentUserProfile,
  onOpenAuthModal,
  onLogout
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b-2 border-amber-500/60 shadow-xl relative overflow-hidden">
      {/* Official Gold Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600"></div>

      <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[48px]">
          
          {/* Left Section: Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Trigger */}
            {onOpenMobileMenu && (
              <button 
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 shrink-0"
                title="เปิดเมนูซ้ายมือ"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/40 tracking-wide flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  มทบ.๔๒ • ค่ายเสนานารงค์
                </span>
                <span className="hidden xs:inline-flex bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full items-center gap-1 border border-emerald-400/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  เรียลไทม์
                </span>
              </div>

              <h1 className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-white drop-shadow-sm leading-tight truncate sm:whitespace-normal">
                ระบบติดตามการเบิกจ่ายงบประมาณ มณฑลทหารบกที่ ๔๒
              </h1>
            </div>
          </div>

          {/* Action Buttons on Header Right */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative">
            
            {/* User Auth Profile Badge or Login Button */}
            {currentUserProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-9 sm:h-10 px-2.5 sm:px-3 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition flex items-center gap-2 shadow-sm"
                >
                  <div className={`p-1 rounded-full ${currentUserProfile.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {currentUserProfile.role === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left hidden sm:block leading-tight">
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUserProfile.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {currentUserProfile.department} • {currentUserProfile.role === 'ADMIN' ? 'Admin' : 'User'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* User Profile Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs text-slate-200 animate-fadeIn">
                    <div className="p-2.5 bg-slate-950/80 rounded-xl mb-1.5 border border-slate-800">
                      <div className="font-bold text-amber-300 truncate">
                        {currentUserProfile.displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {currentUserProfile.email}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentUserProfile.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {currentUserProfile.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (User)'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {currentUserProfile.department}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal('login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>สลับบัญชีผู้ใช้งาน</span>
                    </button>

                    {onOpenAdminAuthModal && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAdminAuthModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition flex items-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ตั้งค่ารหัสผ่าน Admin</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-800"></div>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/60 text-rose-300 transition flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="h-9 sm:h-10 px-2.5 sm:px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700 shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                  <span className="sm:hidden text-[11px]">ล็อกอิน</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="h-9 sm:h-10 px-2.5 sm:px-3.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/40 shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <span className="hidden sm:inline">สมัครสมาชิก</span>
                  <span className="sm:hidden text-[11px]">สมัคร</span>
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="รีเฟรชข้อมูล"
              className="h-9 w-9 sm:h-10 sm:w-10 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 rounded-lg border border-slate-700 shadow-sm transition flex items-center justify-center disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Add New Disbursement Request Button */}
            <button
              onClick={onOpenAddModal}
              className="h-9 sm:h-10 px-2.5 sm:px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 sm:gap-2 border border-amber-300 whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="hidden sm:inline">ตั้งเบิกงบประมาณใหม่</span>
              <span className="sm:hidden text-[11px]">ตั้งเบิก</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};


