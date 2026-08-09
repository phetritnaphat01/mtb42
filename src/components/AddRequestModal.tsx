import React, { useState, useEffect } from 'react';
import { DisbursementItem, BudgetCategory, DisbursementStatus, DEFAULT_BUDGET_CATEGORIES, DEFAULT_BUDGET_OFFICERS, DEFAULT_APPROVERS } from '../types';
import { X, Plus, Building2, Calendar, FileText, DollarSign, UserCheck, Shield } from 'lucide-react';

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: DisbursementItem) => void;
  categories?: string[];
  departmentList?: string[];
  budgetOfficers?: string[];
  approvers?: string[];
}

export const AddRequestModal: React.FC<AddRequestModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  departmentList,
  budgetOfficers,
  approvers
}) => {
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
  const budgetOfficerOptions = budgetOfficers && budgetOfficers.length > 0 ? budgetOfficers : DEFAULT_BUDGET_OFFICERS;
  const approverOptions = approvers && approvers.length > 0 ? approvers : DEFAULT_APPROVERS;

  const getInitialFormData = (): Partial<DisbursementItem> => ({
    department: deptOptions[0] || 'บก.มทบ.42',
    requestDate: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }),
    docNumber: '',
    item: '',
    category: categoryOptions[0] || 'งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)',
    amount: 0,
    budgetOfficer: budgetOfficerOptions[0] || 'หัวหน้างบประมาณ',
    approver: approverOptions[0] || 'นายทหารเบิกจ่าย 1',
    status: 'ยื่นเอกสาร',
    notes: '',
    returnDate: '',
    transferDate: ''
  });

  const [formData, setFormData] = useState<Partial<DisbursementItem>>(getInitialFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.docNumber || !formData.amount) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รายการ, หลักฐานฎีกา, และยอดเงิน)');
      return;
    }

    onAdd({
      id: '', // Will be assigned by backend
      department: formData.department || deptOptions[0] || 'บก.มทบ.42',
      requestDate: formData.requestDate || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      docNumber: formData.docNumber,
      item: formData.item,
      category: (formData.category as BudgetCategory) || categoryOptions[0],
      amount: Number(formData.amount),
      budgetOfficer: formData.budgetOfficer || budgetOfficerOptions[0],
      approver: formData.approver || approverOptions[0],
      status: 'ยื่นเอกสาร', // Always initial status 'ยื่นเอกสาร'
      notes: formData.notes || '',
      returnDate: '',
      transferDate: ''
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">บันทึกตั้งเบิกงบประมาณใหม่</h3>
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
            
            {/* หน่วยตั้งเบิก */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หน่วยตั้งเบิก *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {deptOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* วันที่ตั้งเบิก */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ตั้งเบิก (วัน/เดือน/ปี พ.ศ.) *
              </label>
              <input
                type="text"
                placeholder="เช่น 6/2/2569"
                value={formData.requestDate}
                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                placeholder="เช่น 23/69 หรือ 176"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                placeholder="เช่น 1000000"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

          </div>

          {/* รายการ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายการเบิกจ่าย / รายละเอียด *
            </label>
            <input
              type="text"
              placeholder="เช่น ค่าเบี้ยเลี้ยงเดินทางไปราชการ, ค่าวัสดุสำนักงาน"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {budgetOfficerOptions.map((off) => (
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {approverOptions.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>
          </div>



          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={2}
              placeholder="ระบุข้อความ เช่น เอกสารขาดใบเสนอราคา หรือ ข้อมูลประกอบเพิ่มเติม..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
            />
          </div>

          {/* Submit Actions */}
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
              className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow transition"
            >
              บันทึกข้อมูลคำขอ
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
