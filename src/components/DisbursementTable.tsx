import React, { useState } from 'react';
import { 
  DisbursementItem, 
  DisbursementStatus, 
  FeatureFlags,
  DEFAULT_DOC_AUDIT_STATUSES,
  DEFAULT_DISBURSEMENT_STATUSES
} from '../types';
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
  Loader2,
  Lock,
  ShieldCheck,
  Unlock,
  Grid,
  Minimize2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Plus
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
  onQuickUpdateStatus: (id: string, newStatus: DisbursementStatus, field?: 'status' | 'docAuditStatus') => void;
  monthOptions: { label: string; value: string }[];
  isAdmin?: boolean;
  onOpenAdminAuthModal?: () => void;
  onOpenAddModal?: () => void;
  categoryList?: string[];
  departmentList?: string[];
  docAuditStatusList?: string[];
  statusList?: string[];
  featureFlags?: FeatureFlags;
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
  monthOptions,
  isAdmin = false,
  onOpenAdminAuthModal,
  onOpenAddModal,
  categoryList = [],
  departmentList = [],
  docAuditStatusList = [],
  statusList = [],
  featureFlags
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute permissions based on user role and Admin feature flags
  const canAdd = isAdmin
    ? (featureFlags?.createDisbursementAdmin ?? true)
    : (featureFlags?.createDisbursementUser ?? true);

  const canEdit = isAdmin
    ? (featureFlags?.editDisbursementAdmin ?? true)
    : (featureFlags?.editDisbursementUser ?? true);

  const canDelete = isAdmin
    ? (featureFlags?.deleteDisbursementAdmin ?? true)
    : (featureFlags?.deleteDisbursementUser ?? true);

  const canPrint = isAdmin
    ? (featureFlags?.printVoucherAdmin ?? true)
    : (featureFlags?.printVoucherUser ?? true);

  const canExport = isAdmin
    ? (featureFlags?.exportDataAdmin ?? true)
    : (featureFlags?.exportDataUser ?? true);

  const canChangeStatus = isAdmin
    ? (featureFlags?.editDisbursementAdmin ?? true)
    : (featureFlags?.editDisbursementUser ?? true);

  const renderInteractiveStatusBadge = (
    status: string, 
    itemId: string, 
    field: 'status' | 'docAuditStatus' = 'status'
  ) => {
    const options = field === 'docAuditStatus'
      ? (docAuditStatusList && docAuditStatusList.length > 0 ? docAuditStatusList : DEFAULT_DOC_AUDIT_STATUSES)
      : (statusList && statusList.length > 0 ? statusList : DEFAULT_DISBURSEMENT_STATUSES);

    const getBadgeColorClass = (st: string) => {
      switch (st) {
        case 'อนุมัติ':
          return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
        case 'โอนเงินแล้ว':
          return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
        case 'ตรวจสอบเอกสารเรียบร้อย':
          return 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200';
        case 'รอตรวจสอบเอกสาร':
          return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
        case 'ยื่นเอกสาร':
          return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
        case 'ส่งคืนเอกสารแก้ไข':
          return 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      }
    };

    if (canChangeStatus) {
      return (
        <div className="relative inline-block">
          <select
            value={status}
            onChange={(e) => onQuickUpdateStatus(itemId, e.target.value as DisbursementStatus, field)}
            className={`text-xs font-bold px-3 py-1 rounded-full cursor-pointer border shadow-2xs transition-all appearance-none pr-6 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 ${getBadgeColorClass(status)}`}
            title={`คลิกเพื่อเปลี่ยน${field === 'docAuditStatus' ? 'สถานะการตรวจสอบเอกสาร' : 'สถานะคำขอเบิกจ่าย'}`}
          >
            {options.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
        </div>
      );
    } else {
      return (
        <button
          type="button"
          onClick={() => onOpenAdminAuthModal?.()}
          className="cursor-pointer transition hover:opacity-80"
          title="คลิกเพื่อเข้าสู่ระบบ/เปลี่ยนสถานะ"
        >
          {getStatusBadge(status)}
        </button>
      );
    }
  };
  
  // Custom Grid Line & Density State
  const [gridStyle, setGridStyle] = useState<'off' | 'light' | 'medium' | 'strong' | 'dashed'>('medium');
  const [density, setDensity] = useState<'normal' | 'compact' | 'tight'>('compact');

  const getCellPadding = () => {
    switch (density) {
      case 'tight':
        return 'py-1 px-1.5 text-[11px]';
      case 'compact':
        return 'py-1.5 px-2 text-[11.5px]';
      case 'normal':
      default:
        return 'py-2.5 px-2.5 text-xs';
    }
  };

  const getHeaderPadding = () => {
    switch (density) {
      case 'tight':
        return 'py-1.5 px-1.5 text-[11px]';
      case 'compact':
        return 'py-2 px-2 text-[11.5px]';
      case 'normal':
      default:
        return 'py-2.5 px-2.5 text-xs';
    }
  };

  const getGridCellClass = () => {
    switch (gridStyle) {
      case 'off':
        return 'border-b border-slate-200';
      case 'light':
        return 'border-r border-b border-slate-200';
      case 'medium':
        return 'border-r border-b border-slate-300';
      case 'strong':
        return 'border-r border-b border-slate-400 font-medium';
      case 'dashed':
        return 'border-r border-b border-dashed border-slate-300';
      default:
        return 'border-r border-b border-slate-300';
    }
  };

  const getHeaderGridClass = () => {
    switch (gridStyle) {
      case 'off':
        return 'border-b border-slate-300';
      case 'light':
        return 'border-r border-b border-slate-300';
      case 'medium':
        return 'border-r border-b border-slate-400';
      case 'strong':
        return 'border-r border-b border-slate-500 font-bold';
      case 'dashed':
        return 'border-r border-b border-dashed border-slate-400';
      default:
        return 'border-r border-b border-slate-400';
    }
  };

  const getOuterTableClass = () => {
    switch (gridStyle) {
      case 'off':
        return 'border-b border-slate-200';
      case 'light':
        return 'border-t border-l border-r border-b border-slate-200';
      case 'medium':
        return 'border-t border-l border-r border-b border-slate-300';
      case 'strong':
        return 'border-t border-l border-r border-b border-slate-400';
      case 'dashed':
        return 'border-t border-l border-r border-b border-dashed border-slate-300';
      default:
        return 'border-t border-l border-r border-b border-slate-300';
    }
  };

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
      case 'ตรวจสอบเอกสารเรียบร้อย':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-1.5"></span>
            ตรวจสอบเอกสารเรียบร้อย
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
      
      {/* Read-Only Mode Banner */}
      {!isAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-400/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <span className="font-bold">โหมดผู้ใช้ทั่วไป (อ่านอย่างเดียว - Read-Only):</span> สามารถค้นหา ดูข้อมูล พิมพ์ใบฎีกา และส่งออกเอกสารได้ หากต้องการตั้งเบิก แก้ไข หรือลบเอกสาร โปรดปลดล็อกสิทธิ์ Admin
            </span>
          </div>
          {onOpenAdminAuthModal && (
            <button
              onClick={onOpenAdminAuthModal}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1 shrink-0"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>ปลดล็อก Admin</span>
            </button>
          )}
        </div>
      )}

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
            {/* Adjustable Grid Lines Control */}
            <div className="h-10 p-1 bg-slate-200/80 rounded-lg border border-slate-300 flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-bold text-slate-700 px-1.5 flex items-center gap-1 shrink-0">
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                <span>เส้นตาราง:</span>
              </span>
              <button
                type="button"
                onClick={() => setGridStyle('off')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  gridStyle === 'off' 
                    ? 'bg-white text-indigo-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ไม่มีเส้นตาราง (ซ่อนเส้นตั้ง)"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => setGridStyle('light')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  gridStyle === 'light' 
                    ? 'bg-white text-indigo-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="เส้นบาง (สีเทาอ่อน)"
              >
                บาง
              </button>
              <button
                type="button"
                onClick={() => setGridStyle('medium')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  gridStyle === 'medium' 
                    ? 'bg-white text-indigo-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="เส้นปกติ"
              >
                ปกติ
              </button>
              <button
                type="button"
                onClick={() => setGridStyle('strong')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  gridStyle === 'strong' 
                    ? 'bg-white text-indigo-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="เส้นเข้มชัดเจน"
              >
                เข้ม
              </button>
              <button
                type="button"
                onClick={() => setGridStyle('dashed')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  gridStyle === 'dashed' 
                    ? 'bg-white text-indigo-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="เส้นประ"
              >
                เส้นประ
              </button>
            </div>

            {/* Density / Zoom Controls */}
            <div className="h-10 p-1 bg-slate-200/80 rounded-lg border border-slate-300 flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-bold text-slate-700 px-1.5 flex items-center gap-1 shrink-0">
                <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                <span>ย่อตาราง:</span>
              </span>
              <button
                type="button"
                onClick={() => setDensity('normal')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  density === 'normal' 
                    ? 'bg-white text-blue-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ขนาดปกติ"
              >
                ปกติ
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  density === 'compact' 
                    ? 'bg-white text-blue-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ย่อเข้า (กะทัดรัด)"
              >
                ย่อเข้า
              </button>
              <button
                type="button"
                onClick={() => setDensity('tight')}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  density === 'tight' 
                    ? 'bg-white text-blue-900 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ย่อสุด (Ultra Compact)"
              >
                ย่อสุด
              </button>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={!canExport || isExportingExcel || items.length === 0}
              className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-emerald-500 disabled:opacity-50"
              title={canExport ? "ส่งออกรายการฎีกาเป็นไฟล์ Excel (.xlsx)" : "ฟังก์ชั่นส่งออกถูกปิดใช้งานโดย Admin"}
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
              disabled={!canExport || isExportingPdf || items.length === 0}
              className="h-10 px-3.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-rose-600 disabled:opacity-50"
              title={canExport ? "ส่งออกรายการฎีกาเป็นไฟล์ PDF (.pdf)" : "ฟังก์ชั่นส่งออกถูกปิดใช้งานโดย Admin"}
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>ส่งออก PDF</span>
            </button>

            {/* Add New Request Button */}
            <button
              onClick={onOpenAddModal}
              disabled={!canAdd}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5 border border-blue-500 disabled:opacity-50 cursor-pointer"
              title={canAdd ? "เพิ่มรายการคำขอเบิกจ่ายใหม่" : "ฟังก์ชั่นยื่นคำขอถูกปิดใช้งานโดย Admin"}
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มข้อมูลคำขอ</span>
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
              {departmentList.length > 0 ? (
                departmentList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))
              ) : (
                <>
                  <option value="บก.มทบ.42">บก.มทบ.42</option>
                  <option value="กรม ทพ.42">กรม ทพ.42</option>
                  <option value="ทน.4">ทน.4</option>
                  <option value="ฝคง.มทบ.42">ฝคง.มทบ.42</option>
                </>
              )}
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
              {categoryList.length > 0 ? (
                categoryList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <>
                  <option value="งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)">งบบุคลากร</option>
                  <option value="งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)">งบดำเนินงาน</option>
                  <option value="งบสาธารณูปโภค">งบสาธารณูปโภค</option>
                  <option value="งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)">งบลงทุน</option>
                  <option value="งบอุดหนุน/โครงการพิเศษ">งบอุดหนุน/โครงการพิเศษ</option>
                  <option value="งบรายจ่ายอื่น">งบรายจ่ายอื่น</option>
                </>
              )}
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
              {Array.from(new Set([
                ...(statusList && statusList.length > 0 ? statusList : DEFAULT_DISBURSEMENT_STATUSES),
                ...(docAuditStatusList && docAuditStatusList.length > 0 ? docAuditStatusList : DEFAULT_DOC_AUDIT_STATUSES)
              ])).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Data Table */}
      <div className={`overflow-x-auto ${getOuterTableClass()}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-slate-800 font-semibold uppercase tracking-wider ${
              gridStyle !== 'off' ? 'bg-slate-200/90' : 'bg-slate-100/80 border-b border-slate-200'
            }`}>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>เลขที่คำขอ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>หน่วยตั้งเบิก</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>วันที่ตั้งเบิก</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>หลักฐานฎีกา</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>รายการ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap text-right`}>ยอดเงิน</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>ฝ่ายงบประมาณ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>สถานะการตรวจสอบเอกสาร</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>ฝ่ายอนุมัติ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap text-center`}>สถานะ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>หมายเหตุ</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>วันที่ส่งคืนเอกสารแก้ไข</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap`}>วันที่โอนเงิน</th>
              <th className={`${getHeaderPadding()} ${getHeaderGridClass()} whitespace-nowrap text-center sticky right-0 bg-slate-200 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.08)]`}>จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  ไม่พบข้อมูลคำขอเบิกจ่ายงบประมาณตรงกับเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-blue-50/50 transition ${
                    item.status === 'ส่งคืนเอกสารแก้ไข' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  
                  {/* 1. เลขที่คำขอ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} font-bold text-blue-900 whitespace-nowrap`}>
                    {item.id}
                  </td>

                  {/* 2. หน่วยตั้งเบิก */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} whitespace-nowrap`}>
                    <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {item.department}
                    </span>
                  </td>

                  {/* 3. วันที่ตั้งเบิก */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} whitespace-nowrap text-slate-600 font-mono`}>
                    {item.requestDate}
                  </td>

                  {/* 4. หลักฐานฎีกา */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} font-medium text-slate-900 whitespace-nowrap`}>
                    {item.docNumber || '-'}
                  </td>

                  {/* 5. รายการ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()}`}>
                    <div className="font-semibold text-slate-900 leading-tight">{item.item}</div>
                    {item.category && (
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-xs" title={item.category}>
                        {item.category}
                      </div>
                    )}
                  </td>

                  {/* 6. ยอดเงิน */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} text-right font-bold text-slate-900 whitespace-nowrap font-mono`}>
                    {formatTHB(item.amount)}
                  </td>

                  {/* 7. ฝ่ายงบประมาณ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} text-slate-800 font-medium whitespace-nowrap`}>
                    <div className="font-semibold text-slate-900">{item.budgetOfficer || '-'}</div>
                  </td>

                  {/* 8. สถานะการตรวจสอบเอกสาร */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} whitespace-nowrap`}>
                    {renderInteractiveStatusBadge(item.docAuditStatus || item.status, item.id, 'docAuditStatus')}
                  </td>

                  {/* 9. ฝ่ายอนุมัติ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} text-slate-800 font-medium whitespace-nowrap`}>
                    {item.approver || '-'}
                  </td>

                  {/* 10. สถานะ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} text-center whitespace-nowrap`}>
                    {renderInteractiveStatusBadge(item.status, item.id, 'status')}
                  </td>

                  {/* 10. หมายเหตุ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} max-w-xs`}>
                    <div className={`font-medium line-clamp-2 ${
                      item.status === 'ส่งคืนเอกสารแก้ไข' ? 'text-rose-700 font-semibold' : 'text-slate-700'
                    }`}>
                      {item.notes || '-'}
                    </div>
                  </td>

                  {/* 11. วันที่ส่งคืนเอกสารแก้ไข */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} whitespace-nowrap text-slate-600 font-mono text-center`}>
                    {item.returnDate ? (
                      <span className="text-rose-700 font-semibold">{item.returnDate}</span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 12. วันที่โอนเงิน */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} whitespace-nowrap text-slate-600 font-mono text-center`}>
                    {item.transferDate ? (
                      <span className="text-emerald-700 font-semibold">{item.transferDate}</span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* 13. จัดการ */}
                  <td className={`${getCellPadding()} ${getGridCellClass()} text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-blue-50/90 z-10 shadow-[-3px_0_6px_-2px_rgba(0,0,0,0.08)]`}>
                    <div className="flex items-center justify-center space-x-1">
                      {/* Print Voucher Button */}
                      {canPrint ? (
                        <button
                          onClick={() => onPrintVoucher(item)}
                          title="พิมพ์ใบฎีกา / ใบเบิกงบประมาณ"
                          className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          title="ฟังก์ชั่นพิมพ์ใบฎีกาถูกปิดใช้งานโดย Admin"
                          className="p-1 text-slate-300 cursor-not-allowed"
                        >
                          <Printer className="w-3.5 h-3.5 opacity-40" />
                        </button>
                      )}

                      {/* Edit Button */}
                      {canEdit ? (
                        <button
                          onClick={() => onEditItem(item)}
                          title="แก้ไขข้อมูลคำขอ"
                          className="p-1 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={onOpenAdminAuthModal}
                          title="จำกัดสิทธิ์อ่านอย่างเดียว (กดเพื่อใส่รหัสผ่าน Admin)"
                          className="p-1 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {canDelete ? (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="ลบคำขอ"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={onOpenAdminAuthModal}
                          title="จำกัดสิทธิ์อ่านอย่างเดียว (กดเพื่อใส่รหัสผ่าน Admin)"
                          className="p-1 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}
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
