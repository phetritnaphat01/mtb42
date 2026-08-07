import React, { useState, useEffect } from 'react';
import { DisbursementItem, BudgetCategory, DisbursementStatus } from '../types';
import { X, Save, Edit3 } from 'lucide-react';

interface EditRequestModalProps {
  isOpen: boolean;
  item: DisbursementItem | null;
  onClose: () => void;
  onSave: (updatedItem: DisbursementItem) => void;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<DisbursementItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
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
                <option value="บก.มทบ.42">บก.มทบ.42</option>
                <option value="กรม ทพ.42">กรม ทพ.42</option>
                <option value="ทน.4">ทน.4</option>
                <option value="ฝคง">ฝคง</option>
                <option value="ร.5 พัน.1">ร.5 พัน.1</option>
                <option value="พัน.พัฒนา 4">พัน.พัฒนา 4</option>
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

            {/* สถานะ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการเบิกจ่าย *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DisbursementStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900"
              >
                <option value="ยื่นเอกสาร">ยื่นเอกสาร</option>
                <option value="รอตรวจสอบเอกสาร">รอตรวจสอบเอกสาร</option>
                <option value="อนุมัติ">อนุมัติ</option>
                <option value="ส่งคืนเอกสารแก้ไข">ส่งคืนเอกสารแก้ไข</option>
                <option value="โอนเงินแล้ว">โอนเงินแล้ว</option>
                <option value="ยกเลิก">ยกเลิก</option>
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
              <option value="งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)">งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)</option>
              <option value="งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)">งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)</option>
              <option value="งบสาธารณูปโภค">งบสาธารณูปโภค</option>
              <option value="งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)">งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)</option>
              <option value="งบอุดหนุน/โครงการพิเศษ">งบอุดหนุน/โครงการพิเศษ</option>
              <option value="งบรายจ่ายอื่น">งบรายจ่ายอื่น</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* ฝ่ายงบประมาณ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ฝ่ายงบประมาณ
              </label>
              <input
                type="text"
                value={formData.budgetOfficer}
                onChange={(e) => setFormData({ ...formData, budgetOfficer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            {/* ฝ่ายอนุมัติ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ฝ่ายอนุมัติ
              </label>
              <input
                type="text"
                value={formData.approver}
                onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
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
