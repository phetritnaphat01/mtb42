import React, { useState } from 'react';
import { DisbursementItem, DisbursementStatus } from '../types';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';
import { 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  FileText,
  Calendar,
  Building2,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  FileDown,
  Loader2
} from 'lucide-react';

interface DisbursementTableProps {
  items: DisbursementItem[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedMonth: string;
  onMonthChange: (val: string) => void;
  selectedDept: string;
  onDeptChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onEditItem: (item: DisbursementItem) => void;
  onDeleteItem: (id: string) => void;
  onPrintVoucher: (item: DisbursementItem) => void;
  onQuickUpdateStatus: (id: string, newStatus: DisbursementStatus) => void;
  monthOptions: { label: string; value: string }[];
}

export const DisbursementTable: React.FC<DisbursementTableProps> = ({
  items,
  searchTerm,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  selectedDept,
  onDeptChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onEditItem,
  onDeleteItem,
  onPrintVoucher,
  onQuickUpdateStatus,
  monthOptions
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      exportToExcel(items);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportToPdf(items);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  const getStatusBadge = (status: DisbursementStatus) => {
    switch (status) {
      case 'อนุมัติ':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            อนุมัติ
          </span>
        );
      case 'โอนเงินแล้ว':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>
            โอนเงินแล้ว
          </span>
        );
      case 'รอตรวจสอบเอกสาร':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
            รอตรวจสอบเอกสาร
          </span>
        );
      case 'ยื่นเอกสาร':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
            ยื่นเอกสาร
          </span>
        );
      case 'ส่งคืนเอกสารแก้ไข':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping"></span>
            ส่งคืนเอกสารแก้ไข
          </span>
        );
      case 'ยกเลิก':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden my-6">
      
      {/* Table Controls / Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่คำขอ, ฎีกา, รายการ, หน่วยเบิก หรือหมายเหตุ..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel || items.length === 0}
              className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-emerald-500 disabled:opacity-50"
              title="ส่งออกรายการฎีกาเป็นไฟล์ Excel (.xlsx)"
            >
              {isExportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>ส่งออก Excel</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || items.length === 0}
              className="h-10 px-3.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-rose-600 disabled:opacity-50"
              title="ส่งออกรายการฎีกาเป็นไฟล์ PDF (.pdf)"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>ส่งออก PDF</span>
            </button>

            <div className="h-10 px-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center text-xs font-medium text-slate-600 shrink-0">
              แสดง <span className="font-bold text-slate-900 mx-1">{items.length}</span> รายการ
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              เดือนที่ตั้งเบิก
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            >
              <option value="ALL">-- ทุกเดือน --</option>
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              หน่วยตั้งเบิก
            </label>
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            >
              <option value="ALL">-- ทุกหน่วยตั้งเบิก --</option>
              <option value="บก.มทบ.42">บก.มทบ.42</option>
              <option value="กรม ทพ.42">กรม ทพ.42</option>
              <option value="ทน.4">ทน.4</option>
              <option value="ฝคง">ฝคง</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              ประเภทรายการงบประมาณ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            >
              <option value="ALL">-- ทุกประเภทรายการ --</option>
              <option value="งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)">งบบุคลากร</option>
              <option value="งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)">งบดำเนินงาน</option>
              <option value="งบสาธารณูปโภค">งบสาธารณูปโภค</option>
              <option value="งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)">งบลงทุน</option>
              <option value="งบอุดหนุน/โครงการพิเศษ">งบอุดหนุน/โครงการพิเศษ</option>
              <option value="งบรายจ่ายอื่น">งบรายจ่ายอื่น</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              สถานะการเบิกจ่าย
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            >
              <option value="ALL">-- ทุกสถานะ --</option>
              <option value="ยื่นเอกสาร">ยื่นเอกสาร</option>
              <option value="รอตรวจสอบเอกสาร">รอตรวจสอบเอกสาร</option>
              <option value="อนุมัติ">อนุมัติ</option>
              <option value="ส่งคืนเอกสารแก้ไข">ส่งคืนเอกสารแก้ไข</option>
              <option value="โอนเงินแล้ว">โอนเงินแล้ว</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-xs font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-3 px-3">เลขที่คำขอ</th>
              <th className="py-3 px-3">หน่วยตั้งเบิก</th>
              <th className="py-3 px-3">วันที่ตั้งเบิก</th>
              <th className="py-3 px-3">หลักฐานฎีกา</th>
              <th className="py-3 px-3">รายการ / ประเภทงบ</th>
              <th className="py-3 px-3 text-right">ยอดเงิน (บาท)</th>
              <th className="py-3 px-3">ฝ่ายงบประมาณ / ฝ่ายอนุมัติ</th>
              <th className="py-3 px-3 text-center">สถานะ</th>
              <th className="py-3 px-3">หมายเหตุ / วันที่ดำเนินการ</th>
              <th className="py-3 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  ไม่พบข้อมูลคำขอเบิกจ่ายงบประมาณตรงกับเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-blue-50/40 transition ${
                    item.status === 'ส่งคืนเอกสารแก้ไข' ? 'bg-rose-50/20' : ''
                  }`}
                >
                  
                  {/* 1. เลขที่คำขอ */}
                  <td className="py-3.5 px-3 font-bold text-blue-900 whitespace-nowrap">
                    {item.id}
                  </td>

                  {/* 2. หน่วยตั้งเบิก */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {item.department}
                    </span>
                  </td>

                  {/* 3. วันที่ตั้งเบิก */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-mono">
                    {item.requestDate}
                  </td>

                  {/* 4. หลักฐานฎีกา */}
                  <td className="py-3.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {item.docNumber}
                  </td>

                  {/* 5. รายการ + ประเภทงบ */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">{item.item}</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate max-w-xs" title={item.category}>
                      {item.category}
                    </div>
                  </td>

                  {/* 6. ยอดเงิน */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap font-mono">
                    {formatTHB(item.amount)}
                  </td>

                  {/* 7. ฝ่ายงบประมาณ + ฝ่ายอนุมัติ */}
                  <td className="py-3.5 px-3">
                    <div className="text-slate-800 font-medium line-clamp-1" title={item.budgetOfficer}>
                      <span className="text-slate-400">งบ:</span> {item.budgetOfficer || '-'}
                    </div>
                    <div className="text-slate-600 text-[11px] line-clamp-1" title={item.approver}>
                      <span className="text-slate-400">อนุมัติ:</span> {item.approver || '-'}
                    </div>
                  </td>

                  {/* 8. สถานะ */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(item.status)}
                    <div className="mt-1">
                      <select
                        value={item.status}
                        onChange={(e) => onQuickUpdateStatus(item.id, e.target.value as DisbursementStatus)}
                        className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 hover:border-slate-400 transition"
                      >
                        <option value="ยื่นเอกสาร">ยื่นเอกสาร</option>
                        <option value="รอตรวจสอบเอกสาร">รอตรวจสอบเอกสาร</option>
                        <option value="อนุมัติ">อนุมัติ</option>
                        <option value="ส่งคืนเอกสารแก้ไข">ส่งคืนเอกสารแก้ไข</option>
                        <option value="โอนเงินแล้ว">โอนเงินแล้ว</option>
                        <option value="ยกเลิก">ยกเลิก</option>
                      </select>
                    </div>
                  </td>

                  {/* 9. หมายเหตุ & วันที่ */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className={`text-xs font-medium line-clamp-2 ${
                      item.status === 'ส่งคืนเอกสารแก้ไข' ? 'text-rose-700 font-semibold' : 'text-slate-700'
                    }`}>
                      {item.notes || '-'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 space-x-2">
                      {item.returnDate && (
                        <span>ส่งคืน: {item.returnDate}</span>
                      )}
                      {item.transferDate && (
                        <span className="text-emerald-700">โอน: {item.transferDate}</span>
                      )}
                    </div>
                  </td>

                  {/* 10. จัดการ */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onPrintVoucher(item)}
                        title="พิมพ์ใบฎีกา / ใบเบิกงบประมาณ"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditItem(item)}
                        title="แก้ไขข้อมูลคำขอ"
                        className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        title="ลบคำขอ"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
