import React from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

interface IdleTimeoutWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  idleMinutes: number;
  onContinue: () => void;
  onLogoutNow: () => void;
}

export const IdleTimeoutWarningModal: React.FC<IdleTimeoutWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  idleMinutes,
  onContinue,
  onLogoutNow
}) => {
  if (!isOpen) return null;

  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;
  const timeFormatted = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 text-slate-800 space-y-4 relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="flex items-center gap-3 pt-2">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              แจ้งเตือนระบบตัดการเชื่อมต่ออัตโนมัติ
            </h3>
            <p className="text-xs text-slate-500">
              Auto Logout due to Inactivity ({idleMinutes} นาที)
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
          <p className="leading-relaxed">
            ระบบไม่พบการเคลื่อนไหวเมาส์หรือการใช้งานเป็นเวลา <span className="font-bold text-amber-700">{idleMinutes - Math.ceil(remainingSeconds / 60)} นาที</span> เพื่อความปลอดภัยของข้อมูล บัญชีจะถูกออกจากระบบอัตโนมัติใน:
          </p>
          <div className="flex items-center justify-center gap-2 py-2 bg-white rounded-xl border border-amber-300 shadow-inner">
            <Clock className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-mono text-2xl font-black text-amber-600 tracking-wider">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold text-slate-500">นาที</span>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            * ขยับเมาส์ กดคีย์บอร์ด หรือคลิกปุ่มด้านล่างเพื่อใช้งานต่ออย่างต่อเนื่อง
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onLogoutNow}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>ออกจากระบบทันที</span>
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>ขยับเมาส์ / อยู่ใช้งานต่อ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
