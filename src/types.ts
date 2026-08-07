export type DisbursementStatus = 
  | 'ยื่นเอกสาร'
  | 'รอตรวจสอบเอกสาร'
  | 'อนุมัติ'
  | 'ส่งคืนเอกสารแก้ไข'
  | 'โอนเงินแล้ว'
  | 'ยกเลิก';

export type BudgetCategory = 
  | 'งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)'
  | 'งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)'
  | 'งบสาธารณูปโภค'
  | 'งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)'
  | 'งบอุดหนุน/โครงการพิเศษ'
  | 'งบรายจ่ายอื่น';

export interface DisbursementItem {
  id: string; // เลขที่คำขอ e.g. TH001
  department: string; // หน่วยตั้งเบิก e.g. บก.มทบ.42, กรม ทพ.42, ทน.4, ฝคง
  requestDate: string; // วันที่ตั้งเบิก e.g. 6/2/2569
  docNumber: string; // หลักฐานฎีกา e.g. 23/69
  item: string; // รายการ e.g. ค่าเบี้ยเลี้ยง, เบี้ยเลี้ยงเดินทางไปราชการ, TEST
  category: BudgetCategory;
  amount: number; // ยอดเงิน e.g. 1000000
  budgetOfficer: string; // ฝ่ายงบประมาณ e.g. หัวหน้างบประมาณ
  approver: string; // ฝ่ายอนุมัติ e.g. นายทหารเบิกจ่าย 1
  status: DisbursementStatus; // สถานะ
  notes: string; // หมายเหตุ
  returnDate?: string; // วันที่ส่งคืนเอกสารแก้ไข
  transferDate?: string; // วันที่โอนเงิน
}

export interface MonthlySummary {
  monthYear: string; // e.g. "02/2569" or "กุมภาพันธ์ 2569"
  monthName: string;
  yearBE: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  returnedAmount: number;
  count: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DepartmentSummary {
  department: string;
  totalAmount: number;
  approvedAmount: number;
  returnedCount: number;
  pendingCount: number;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}
