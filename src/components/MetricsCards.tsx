import React from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  FileCheck,
  FileX,
  FileClock
} from 'lucide-react';

interface StatsData {
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  returnedAmount: number;
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  returnedCount: number;
}

interface MetricsCardsProps {
  stats: StatsData;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats }) => {
  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const approvedPercent = stats.totalAmount > 0 
    ? ((stats.approvedAmount / stats.totalAmount) * 100).toFixed(1)
    : '0';

  const pendingPercent = stats.totalAmount > 0 
    ? ((stats.pendingAmount / stats.totalAmount) * 100).toFixed(1)
    : '0';

  const returnedPercent = stats.totalAmount > 0 
    ? ((stats.returnedAmount / stats.totalAmount) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4 sm:my-6">
      
      {/* 1. Total Requested Budget */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition"></div>
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              งบประมาณตั้งเบิกรวม
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight break-words">
            {formatTHB(stats.totalAmount)}
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 pt-2 sm:pt-2.5 border-t border-slate-100">
          <span className="flex items-center gap-1 text-blue-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            ทั้งหมด {stats.totalCount} ฎีกา/คำขอ
          </span>
          <span className="text-slate-500 font-mono">100%</span>
        </div>
      </div>

      {/* 2. Approved / Transferred Amount */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition"></div>
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              อนุมัติ / โอนเงินแล้ว
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight break-words">
            {formatTHB(stats.approvedAmount)}
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 pt-2 sm:pt-2.5 border-t border-slate-100">
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {stats.approvedCount} คำขออนุมัติ
          </span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {approvedPercent}%
          </span>
        </div>
      </div>

      {/* 3. Pending Documents */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition"></div>
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              อยู่ระหว่างตรวจสอบ / ยื่นเอกสาร
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <FileClock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight break-words">
            {formatTHB(stats.pendingAmount)}
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 pt-2 sm:pt-2.5 border-t border-slate-100">
          <span className="text-amber-700 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {stats.pendingCount} คำขอนัดตรวจ
          </span>
          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {pendingPercent}%
          </span>
        </div>
      </div>

      {/* 4. Returned for Revision */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition"></div>
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              ส่งคืนเอกสารแก้ไข
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <FileX className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight break-words">
            {formatTHB(stats.returnedAmount)}
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 pt-2 sm:pt-2.5 border-t border-slate-100">
          <span className="text-rose-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {stats.returnedCount} คำขอต้องแก้ไข
          </span>
          <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {returnedPercent}%
          </span>
        </div>
      </div>

    </div>
  );
};
