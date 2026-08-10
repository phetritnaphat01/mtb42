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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">แก้ไขคำขอเบิกจ่าย #{formData.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* เลขที่คำขอ (Disabled) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                เลขที่คำขอ (อ้างอิง)
              </label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-700 font-bold"
              />
            </div>

            {/* หน่วยตั้งเบิก */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หน่วยตั้งเบิก *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              >
                {deptOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* วันที่ตั้งเบิก */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ตั้งเบิก *
              </label>
              <input
                type="text"
                value={formData.requestDate}
                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                required
              />
            </div>

            {/* หลักฐานฎีกา */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หลักฐานฎีกา *
              </label>
              <input
                type="text"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium"
                required
              />
            </div>

            {/* ยอดเงิน */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยอดเงิน (บาท) *
              </label>
              <input
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                required
              />
            </div>

            {/* สถานะการตรวจสอบเอกสาร */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการตรวจสอบเอกสาร *
              </label>
              <select
                value={formData.docAuditStatus || docAuditStatusOpts[0] || 'ยื่นเอกสาร'}
                onChange={(e) => setFormData({ ...formData, docAuditStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900"
              >
                {docAuditStatusOpts.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* สถานะการเบิกจ่าย */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการเบิกจ่าย *
              </label>
              <select
                value={formData.status || statusOpts[0] || 'ยื่นเอกสาร'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DisbursementStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900"
              >
                {statusOpts.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

          </div>

          {/* รายการ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายการเบิกจ่าย *
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              required
            />
          </div>

          {/* ประเภทรายการงบประมาณ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ประเภทรายการงบประมาณ *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* ฝ่ายงบประมาณ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ฝ่ายงบประมาณ (ผู้ตรวจ)
              </label>
              <select
                value={formData.budgetOfficer || ''}
                onChange={(e) => setFormData({ ...formData, budgetOfficer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              >
                <option value="">-- เลือกฝ่ายงบประมาณ --</option>
                {budgetOfficerOpts.map((off) => (
                  <option key={off} value={off}>{off}</option>
                ))}
              </select>
            </div>

            {/* ฝ่ายอนุมัติ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ฝ่ายอนุมัติ (นายทหารเบิกจ่าย)
              </label>
              <select
                value={formData.approver || ''}
                onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              >
                <option value="">-- เลือกฝ่ายอนุมัติ --</option>
                {approverOpts.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>

            {/* วันที่ส่งคืนเอกสารแก้ไข */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ส่งคืนเอกสารแก้ไข
              </label>
              <input
                type="text"
                value={formData.returnDate || ''}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            {/* วันที่โอนเงิน */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่โอนเงิน
              </label>
              <input
                type="text"
                value={formData.transferDate || ''}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / เหตุผลการส่งคืนแก้ไข
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow transition flex items-center gap-1.5"
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
