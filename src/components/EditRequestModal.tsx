import React, { useState, useEffect, useMemo } from 'react';
import { 
  DisbursementItem, 
  BudgetCategory, 
  DisbursementStatus, 
  DEFAULT_BUDGET_CATEGORIES, 
  DEFAULT_BUDGET_OFFICERS, 
  DEFAULT_APPROVERS,
  DEFAULT_DOC_AUDIT_STATUSES,
  DEFAULT_DISBURSEMENT_STATUSES
} from '../types';
import { FileAttachmentSection } from './FileAttachmentSection';
import { X, Save, Edit3 } from 'lucide-react';

interface EditRequestModalProps {
  isOpen: boolean;
  item: DisbursementItem | null;
  onClose: () => void;
  onSave: (updatedItem: DisbursementItem) => void;
  categories?: string[];
  departmentList?: string[];
  budgetOfficers?: string[];
  approvers?: string[];
  docAuditStatusList?: string[];
  statusList?: string[];
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  categories,
  departmentList,
  budgetOfficers,
  approvers,
  docAuditStatusList = [],
  statusList = []
}) => {
  const [formData, setFormData] = useState<DisbursementItem | null>(null);
  const categoryOptions = categories && categories.length > 0 ? categories : DEFAULT_BUDGET_CATEGORIES;
  const deptOptions = departmentList && departmentList.length > 0 ? departmentList : [
    'บก.มทบ.42',
    'กรม ทพ.42',
    'ทน.4',
    'ฝคง.มทบ.42',
    'ฝพ.มทบ.42',
    'ฝกพ.มทบ.42',
    'ฝกห.มทบ.42',
    'ร.5 พัน.1'
  ];

  const docAuditStatusOpts = useMemo(() => {
    const base = docAuditStatusList && docAuditStatusList.length > 0 ? docAuditStatusList : DEFAULT_DOC_AUDIT_STATUSES;
    if (formData?.docAuditStatus && !base.includes(formData.docAuditStatus)) {
      return [formData.docAuditStatus, ...base];
    }
    return base;
  }, [docAuditStatusList, formData?.docAuditStatus]);

  const statusOpts = useMemo(() => {
    const base = statusList && statusList.length > 0 ? statusList : DEFAULT_DISBURSEMENT_STATUSES;
    if (formData?.status && !base.includes(formData.status)) {
      return [formData.status, ...base];
    }
    return base;
  }, [statusList, formData?.status]);

  const budgetOfficerOpts = useMemo(() => {
    const base = budgetOfficers && budgetOfficers.length > 0 ? budgetOfficers : DEFAULT_BUDGET_OFFICERS;
    if (formData?.budgetOfficer && !base.includes(formData.budgetOfficer)) {
      return [formData.budgetOfficer, ...base];
    }
    return base;
  }, [budgetOfficers, formData?.budgetOfficer]);

  const approverOpts = useMemo(() => {
    const base = approvers && approvers.length > 0 ? approvers : DEFAULT_APPROVERS;
    if (formData?.approver && !base.includes(formData.approver)) {
      return [formData.approver, ...base];
    }
    return base;
  }, [approvers, formData?.approver]);

  useEffect(() => {
    if (item) {
      setFormData({ 
        ...item,
        docAuditStatus: item.docAuditStatus || item.status || 'ยื่นเอกสาร'
      });
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white py-3.5 px-5 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Edit3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight text-white">แก้ไขคำขอเบิกจ่าย #{formData.id}</h3>
              <p className="text-[11px] text-slate-400">ปรับปรุงข้อมูลและสถานะการเบิกจ่าย</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* เลขที่คำขอ (Disabled) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  เลขที่คำขอ (อ้างอิง)
                </label>
                <input
                  type="text"
                  value={formData.id}
                  disabled
                  className="w-full h-10 px-3 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-700 font-bold"
                />
              </div>

              {/* หน่วยตั้งเบิก */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หน่วยตั้งเบิก <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  {deptOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* วันที่ตั้งเบิก */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วันที่ตั้งเบิก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                  required
                />
              </div>

              {/* หลักฐานฎีกา */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หลักฐานฎีกา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.docNumber}
                  onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                  required
                />
              </div>

              {/* ยอดเงิน */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ยอดเงิน (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                  required
                />
              </div>

              {/* สถานะการตรวจสอบเอกสาร */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สถานะการตรวจสอบเอกสาร <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.docAuditStatus || docAuditStatusOpts[0] || 'ยื่นเอกสาร'}
                  onChange={(e) => setFormData({ ...formData, docAuditStatus: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  {docAuditStatusOpts.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* สถานะการเบิกจ่าย */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สถานะการเบิกจ่าย <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status || statusOpts[0] || 'ยื่นเอกสาร'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DisbursementStatus })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  {statusOpts.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* รายการเบิกจ่าย */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รายการเบิกจ่าย <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                  required
                />
              </div>

              {/* ประเภทรายการงบประมาณ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทรายการงบประมาณ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* ฝ่ายงบประมาณ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ฝ่ายงบประมาณ (ผู้ตรวจ)
                </label>
                <select
                  value={formData.budgetOfficer || ''}
                  onChange={(e) => setFormData({ ...formData, budgetOfficer: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  <option value="">-- เลือกฝ่ายงบประมาณ --</option>
                  {budgetOfficerOpts.map((off) => (
                    <option key={off} value={off}>{off}</option>
                  ))}
                </select>
              </div>

              {/* ฝ่ายอนุมัติ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ฝ่ายอนุมัติ (นายทหารเบิกจ่าย)
                </label>
                <select
                  value={formData.approver || ''}
                  onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                >
                  <option value="">-- เลือกฝ่ายอนุมัติ --</option>
                  {approverOpts.map((app) => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>

              {/* วันที่ส่งคืนเอกสารแก้ไข */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วันที่ส่งคืนเอกสารแก้ไข
                </label>
                <input
                  type="text"
                  value={formData.returnDate || ''}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                />
              </div>

              {/* วันที่โอนเงิน */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  วันที่โอนเงิน
                </label>
                <input
                  type="text"
                  value={formData.transferDate || ''}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                />
              </div>

            </div>

            {/* แนบไฟล์ PDF / รูปภาพ */}
            <FileAttachmentSection
              files={formData.attachments || []}
              onChange={(newFiles) => setFormData({ ...formData, attachments: newFiles })}
            />

            {/* หมายเหตุ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                หมายเหตุ / เหตุผลการส่งคืนแก้ไข
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs resize-y"
              />
            </div>

          </div>

          {/* Modal Footer (Fixed at bottom) */}
          <div className="bg-slate-50 py-3.5 px-6 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการแก้ไข</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
