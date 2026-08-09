import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  RefreshCw, 
  Menu,
  ShieldCheck,
  Lock,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Clock,
  Calendar,
  MousePointer,
  Timer
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
  idleMinutesSetting?: number;
  idleSecondsLeft?: number;
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
  onLogout,
  idleMinutesSetting = 30,
  idleSecondsLeft
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Thai Date & Time
  const formatThaiDate = (d: Date) => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const dayName = dayNames[d.getDay()];
    const date = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear() + 543; // Buddhist era
    return `วัน${dayName}ที่ ${date} ${month} ${year}`;
  };

  const formatTimeString = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

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
                {/* Live Real-time Clock Badge */}
                <span className="bg-slate-800/90 text-amber-300 text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1.5 shrink-0 shadow-sm">
                  <Clock className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  <span>{formatTimeString(now)} น.</span>
                  <span className="hidden md:inline text-slate-400 font-sans border-l border-slate-700 pl-1.5 font-normal">
                    {formatThaiDate(now)}
                  </span>
                </span>

                {/* Live Idle Mouse Timeout Countdown Badge */}
                {(currentUserProfile || isAdmin) && idleMinutesSetting > 0 && idleSecondsLeft !== undefined && (
                  <span 
                    title="นับเวลาถอยหลังการล็อกเอาท์อัตโนมัติหากไม่มีการเคลื่อนไหวเมาส์หรือใช้งาน"
                    className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 shadow-sm transition-all ${
                      idleSecondsLeft <= 120 
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 animate-pulse' 
                        : idleSecondsLeft <= 300 
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/50' 
                          : 'bg-slate-800/90 text-amber-300/90 border-slate-700'
                    }`}
                  >
                    <MousePointer className={`w-3 h-3 shrink-0 ${idleSecondsLeft <= 120 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                    <span className="text-slate-400 font-sans text-[9px] hidden sm:inline">ไม่ขยับเมาส์:</span>
                    <span>{Math.floor(idleSecondsLeft / 60)}:{String(idleSecondsLeft % 60).padStart(2, '0')}</span>
                  </span>
                )}
              </div>

              <h1 className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-white drop-shadow-sm leading-tight truncate sm:whitespace-normal">
                ระบบติดตามการเบิกจ่ายงบประมาณ มณฑลทหารบกที่ ๔๒
              </h1>
            </div>
          </div>

          {/* Action Buttons on Header Right */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative">
            
            {/* User Auth Profile Badge or Login Button */}
            {currentUserProfile ? null : (
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


