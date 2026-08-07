import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  FileSpreadsheet, 
  FileDown,
  RefreshCw,
  CheckCircle2,
  X,
  HardDrive
} from 'lucide-react';
import { MTHB42_LOGO_URL } from '../data/initialData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onExportToDrive: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onRefresh: () => void;
  isGoogleConnected: boolean;
  isExporting: boolean;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAiModal,
  onExportToDrive,
  onExportExcel,
  onExportPdf,
  onRefresh,
  isGoogleConnected,
  isExporting,
  isLoading,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'ภาพรวม & สรุปงบประมาณ', icon: LayoutDashboard },
    { id: 'table', label: 'รายการฎีกาเบิกจ่าย', icon: FileText },
    { id: 'charts', label: 'กราฟจำแนกงบประมาณ', icon: BarChart3 },
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

        {/* Action Buttons Section */}
        <div className="p-4 space-y-2.5 border-b border-slate-800/60">
          {/* Add New Request Button */}
          <button
            onClick={() => { onOpenAddModal(); onCloseMobile(); }}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition flex items-center justify-center gap-2 border border-amber-300"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>ตั้งเบิกงบประมาณใหม่</span>
          </button>

          {/* AI Advisor Button in Left Menu */}
          <button
            onClick={() => { onOpenAiModal(); onCloseMobile(); }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 border border-purple-400/30 group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>AI วิเคราะห์งบประมาณ</span>
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
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-400/30 shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Export & Utility Actions under Main Menu */}
          <div className="pt-3 mt-2 border-t border-slate-800/60 space-y-1.5">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
              ส่งออกเอกสาร & เชื่อมโยง
            </p>

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
