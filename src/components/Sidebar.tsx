import React, { useState } from 'react';
import { 
  PlusCircle, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  FileSpreadsheet, 
  FileDown,
  RefreshCw,
  CheckCircle2,
  X,
  ShieldCheck,
  Lock,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Building2,
  Users,
  Key,
  Database,
  History
} from 'lucide-react';
import { MTHB42_LOGO_URL, MTHB42_EMBLEM_DATA_URL } from '../data/initialData';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSystemSubTab?: string;
  onSelectSystemSubTab?: (subTab: string) => void;
  onOpenAddModal: () => void;
  onExportToDrive: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onRefresh: () => void;
  isGoogleConnected: boolean;
  isExporting: boolean;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isAdmin?: boolean;
  onOpenAdminAuthModal?: () => void;
  currentUserProfile?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeSystemSubTab = 'logo',
  onSelectSystemSubTab,
  onOpenAddModal,
  onExportToDrive,
  onExportExcel,
  onExportPdf,
  onRefresh,
  isGoogleConnected,
  isExporting,
  isLoading,
  isOpenMobile,
  onCloseMobile,
  isAdmin = false,
  onOpenAdminAuthModal,
  currentUserProfile,
  onOpenAuthModal,
  onLogout
}) => {

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSystemExpanded, setIsSystemExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'ภาพรวม & สรุปงบประมาณ', icon: LayoutDashboard },
    { id: 'table', label: 'รายการฎีกาเบิกจ่าย', icon: FileText },
    { id: 'charts', label: 'กราฟจำแนกงบประมาณ', icon: BarChart3 },
    { id: 'system', label: 'จัดการระบบ', icon: Settings },
    { id: 'login-history', label: 'ประวัติการเข้าสู่ระบบ', icon: History },
    { id: 'permissions', label: 'จัดการสิทธิ์', icon: ShieldCheck },
  ];

  const systemSubItems = [
    { id: 'logo', label: 'ตราประทับ / โลโก้ระบบ', icon: ImageIcon },
    { id: 'units', label: 'หน่วยงาน & รายการงบ', icon: Building2 },
    { id: 'officers', label: 'เจ้าหน้าที่ & นายทหาร', icon: Users },
    { id: 'security', label: 'รหัสผ่าน & ความปลอดภัย', icon: Key },
    { id: 'database', label: 'สถานะระบบ & ฐานข้อมูล', icon: Database },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
    // Scroll smoothly to section if needed
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Left Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-slate-800/80 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Official Gold Accent Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600"></div>

        {/* Sidebar Header & Official Logo */}
        <div className="p-5 border-b border-slate-800/80 relative">
          <button 
            onClick={onCloseMobile}
            className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 bg-white rounded-xl p-1 shadow-lg ring-2 ring-amber-400/50 border border-amber-300 shrink-0 flex items-center justify-center">
              <img 
                src={MTHB42_LOGO_URL} 
                alt="ตรามณฑลทหารบกที่ ๔๒" 
                className="w-full h-full object-contain filter drop-shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = MTHB42_EMBLEM_DATA_URL;
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                มทบ.๔๒ • เสนานารงค์
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-snug mt-1">
                ระบบติดตามงบประมาณ
              </h1>
              <p className="text-[11px] text-slate-400">มณฑลทหารบกที่ ๔๒</p>
            </div>
          </div>
        </div>

        {/* Role Badge & User Account Section */}
        <div className="p-4 space-y-2.5 border-b border-slate-800/60">
          
          {/* User Account Card */}
          {currentUserProfile ? (
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-xl ${currentUserProfile.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {currentUserProfile.role === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {currentUserProfile.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentUserProfile.department}
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                  currentUserProfile.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {currentUserProfile.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => { if (onOpenAuthModal) onOpenAuthModal('login'); onCloseMobile(); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>สลับบัญชี</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => { onLogout(); onCloseMobile(); }}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>ออกจากระบบ</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-slate-200">
                ยังไม่ได้เข้าสู่ระบบ
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                เข้าสู่ระบบหรือสมัครสมาชิกเพื่อสิทธิ์การใช้งานที่สมบูรณ์
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => { if (onOpenAuthModal) onOpenAuthModal('login'); onCloseMobile(); }}
                  className="py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  onClick={() => { if (onOpenAuthModal) onOpenAuthModal('register'); onCloseMobile(); }}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>สมัครสมาชิก</span>
                </button>
              </div>
            </div>
          )}



          {/* Add New Request Button */}
          <button
            onClick={() => { onOpenAddModal(); onCloseMobile(); }}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition flex items-center justify-center gap-2 border border-amber-300"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>ตั้งเบิกงบประมาณใหม่</span>
          </button>
        </div>


        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            เมนูหลักระบบ
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => {
                    handleNavClick(item.id);
                    if (item.id === 'system') {
                      setIsSystemExpanded(!isSystemExpanded);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-400/30 shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.id === 'system' && (
                    <span className="text-slate-400 hover:text-white transition p-0.5">
                      {isSystemExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>

                {item.id === 'system' && isSystemExpanded && (
                  <div className="pl-5 space-y-1 my-1 border-l border-amber-500/30 ml-4">
                    {systemSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'system' && activeSystemSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveTab('system');
                            if (onSelectSystemSubTab) onSelectSystemSubTab(sub.id);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            isSubActive
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Export & Utility Actions under Main Menu (Collapsible) */}
          <div className="pt-3 mt-2 border-t border-slate-800/60 space-y-1.5">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="w-full px-2 py-1 flex items-center justify-between text-left text-slate-400 hover:text-slate-200 transition rounded-lg hover:bg-slate-800/50 group"
            >
              <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ส่งออกเอกสาร & เชื่อมโยง</span>
              </span>
              <span className="text-slate-400 group-hover:text-white transition">
                {isExportOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            </button>

            {isExportOpen && (
              <div className="space-y-1.5 pt-1 transition-all">
                {/* 1. Google Sheets Export */}
                <button
                  onClick={onExportToDrive}
                  disabled={isExporting}
                  className={`w-full px-3.5 py-2 text-white rounded-xl text-xs font-medium transition flex items-center justify-between border ${
                    isGoogleConnected 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="truncate">{isExporting ? 'กำลังส่งออก...' : 'ส่งออก Google Sheets'}</span>
                  </span>
                  {isGoogleConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>

                {/* 2. Excel Export */}
                {onExportExcel && (
                  <button
                    onClick={() => { onExportExcel(); onCloseMobile(); }}
                    className="w-full px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 rounded-xl text-xs font-medium border border-emerald-500/40 transition flex items-center gap-2.5"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ส่งออกไฟล์ Excel (.xlsx)</span>
                  </button>
                )}

                {/* 3. PDF Export */}
                {onExportPdf && (
                  <button
                    onClick={() => { onExportPdf(); onCloseMobile(); }}
                    className="w-full px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 rounded-xl text-xs font-medium border border-rose-500/40 transition flex items-center gap-2.5"
                  >
                    <FileDown className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>ส่งออกไฟล์ PDF (.pdf)</span>
                  </button>
                )}

                {/* 4. Real-time Refresh */}
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className="flex items-center gap-2.5">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                    <span>รีเฟรชข้อมูลเรียลไทม์</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>สถานะระบบ: ออนไลน์</span>
          </div>
          <span className="text-[10px] text-slate-500">มทบ.๔๒ v2.5</span>
        </div>
      </aside>
    </>
  );
};
