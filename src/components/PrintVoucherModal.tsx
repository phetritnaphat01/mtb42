import React from 'react';
import { DisbursementItem } from '../types';
import { X, Printer, ArrowLeft } from 'lucide-react';
import { MTHB42_LOGO_URL } from '../data/initialData';

interface PrintVoucherModalProps {
  isOpen: boolean;
  item: DisbursementItem | null;
  onClose: () => void;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({
  isOpen,
  item,
  onClose
}) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-4 sm:my-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:w-full flex flex-col max-h-[92vh] print:max-h-none">
        
        {/* Non-printable modal header */}
        <div className="bg-slate-900 text-white p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shrink-0"
              title="ย้อนกลับ"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>ย้อนกลับ</span>
            </button>
            <h3 className="font-bold text-xs sm:text-base truncate">ใบฎีกาเสนอเบิกเงิน #{item.id}</h3>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">สั่งพิมพ์เอกสาร</span>
              <span className="sm:hidden">พิมพ์</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE VOUCHER FORM CONTENT */}
        <div className="p-4 sm:p-8 font-serif text-slate-900 space-y-6 print:p-6 overflow-y-auto" id="printable-voucher">
          
          {/* Header Shield & Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 flex items-center justify-center overflow-hidden">
              <img 
                src={MTHB42_LOGO_URL} 
                alt="ตรามณฑลทหารบกที่ ๔๒" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
              มณฑลทหารบกที่ ๔๒ (ค่ายเสนาณรงค์)
            </h1>
            <h2 className="text-base sm:text-lg font-semibold mt-1 text-slate-800">
              ใบฎีกาเบิกเงินงบประมาณ และหนังสือขอรับการอนุมัติเบิกจ่าย
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-sans mt-0.5">
              ระบบติดตามงบประมาณและการเงิน มทบ.42 • เอกสารอ้างอิงระบบเบิกจ่าย
            </p>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-sans border p-3 rounded bg-slate-50 border-slate-300">
            <div>
              <span className="font-bold text-slate-700">เลขที่คำขอเบิกจ่าย:</span>{' '}
              <span className="font-mono font-bold text-blue-900 text-sm">{item.id}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">หลักฐานฎีกาเลขที่:</span>{' '}
              <span className="font-mono font-bold text-slate-900 text-sm">{item.docNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">หน่วยตั้งเบิก:</span>{' '}
              <span className="font-semibold text-slate-900">{item.department}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">วันที่ตั้งเบิก:</span>{' '}
              <span className="font-mono text-slate-900">{item.requestDate}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 font-sans overflow-x-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              รายละเอียดรายการเบิกจ่าย
            </h3>
            <table className="w-full text-xs border-collapse border border-slate-400 min-w-[500px]">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold">
                  <th className="border border-slate-400 p-2 text-left">รายการ / รายละเอียด</th>
                  <th className="border border-slate-400 p-2 text-left">ประเภทรายการงบประมาณ</th>
                  <th className="border border-slate-400 p-2 text-right">ยอดเงินเบิกจ่าย (บาท)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 p-3 font-medium">{item.item}</td>
                  <td className="border border-slate-400 p-3 text-slate-700">{item.category}</td>
                  <td className="border border-slate-400 p-3 text-right font-bold text-base font-mono">
                    {formatTHB(item.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={2} className="border border-slate-400 p-2 text-right">
                    ยอดเงินรวมทั้งสิ้น
                  </td>
                  <td className="border border-slate-400 p-2 text-right text-blue-900 text-base font-mono">
                    {formatTHB(item.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Approval & Audit Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-sans pt-2">
            <div className="border border-slate-300 p-3 rounded space-y-1.5">
              <div className="font-bold text-slate-800 border-b pb-1">ฝ่ายงบประมาณ (ผู้ตรวจสอบ)</div>
              <div>เจ้าหน้าที่: <span className="font-medium">{item.budgetOfficer || '-'}</span></div>
              <div>สถานะ: <span className="font-semibold text-slate-900">{item.status}</span></div>
            </div>

            <div className="border border-slate-300 p-3 rounded space-y-1.5">
              <div className="font-bold text-slate-800 border-b pb-1">ฝ่ายอนุมัติ / นายทหารเบิกจ่าย</div>
              <div>ผู้อนุมัติ: <span className="font-medium">{item.approver || '-'}</span></div>
              <div>วันที่โอน/โอนเงินแล้ว: <span className="font-mono">{item.transferDate || '-'}</span></div>
            </div>
          </div>

          {item.notes && (
            <div className="border border-amber-300 bg-amber-50/50 p-3 rounded text-xs font-sans text-slate-800">
              <span className="font-bold text-amber-900">หมายเหตุ / เหตุผลการส่งคืนแก้ไข:</span> {item.notes}
            </div>
          )}

          {/* Signature Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-center text-xs font-sans pt-8 border-t border-slate-300">
            <div className="space-y-6 sm:space-y-8">
              <p>ลงชื่อ..........................................................ผู้ยื่นเบิก</p>
              <p>(..........................................................)</p>
              <p>ตำแหน่ง..........................................................</p>
            </div>
            <div className="space-y-6 sm:space-y-8">
              <p>ลงชื่อ..........................................................ผู้อนุมัติ</p>
              <p>(..........................................................)</p>
              <p>ตำแหน่ง นายทหารเบิกจ่าย มทบ.42</p>
            </div>
          </div>

        </div>

        {/* Non-printable modal footer / Back button */}
        <div className="bg-slate-100 p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>ย้อนกลับ / ปิดหน้าต่าง</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์เอกสาร</span>
          </button>
        </div>

      </div>
    </div>
  );
};
