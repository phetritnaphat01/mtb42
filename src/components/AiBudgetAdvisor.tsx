import React from 'react';
import { X, Sparkles, AlertCircle, RefreshCw, Bot, CheckCircle2 } from 'lucide-react';

interface AiBudgetAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  analysisText: string;
  isLoading: boolean;
  onReanalyze: () => void;
  error?: string | null;
}

export const AiBudgetAdvisor: React.FC<AiBudgetAdvisorProps> = ({
  isOpen,
  onClose,
  analysisText,
  isLoading,
  onReanalyze,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <h3 className="font-bold text-lg">AI วิเคราะห์ประสิทธิภาพการเบิกจ่ายงบประมาณ (มทบ.42)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Gemini AI กำลังประมวลผลข้อมูลการเบิกจ่ายและตรวจสอบข้อติดขัด...
              </p>
              <p className="text-xs text-slate-500">
                ประมวลผลฎีกา จำแนกประเภทงบประมาณ และจัดทำข้อเสนอแนะ
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <div className="font-bold">เกิดข้อผิดพลาดในการวิเคราะห์</div>
                <div className="mt-1 text-xs">{error}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-slate-800 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs text-indigo-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>ผลวิเคราะห์สร้างโดย Gemini 2.5 Flash จากข้อมูลเรียลไทม์ล่าสุดในระบบ</span>
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {analysisText}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={onReanalyze}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>วิเคราะห์ใหม่อีกครั้ง</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
