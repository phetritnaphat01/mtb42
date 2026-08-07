import { DisbursementItem } from '../types';

export const INITIAL_DISBURSEMENTS: DisbursementItem[] = [
  {
    id: 'TH001',
    department: 'บก.มทบ.42',
    requestDate: '6/2/2569',
    docNumber: '23/69',
    item: 'TEST',
    category: 'งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)',
    amount: 1000000,
    budgetOfficer: 'หัวหน้างบประมาณ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'อนุมัติ',
    notes: 'TEST-ระบบ',
    returnDate: '',
    transferDate: '6/2/2569'
  },
  {
    id: 'TH002',
    department: 'กรม ทพ.42',
    requestDate: '6/2/2569',
    docNumber: '56/69',
    item: 'TEST',
    category: 'งบอุดหนุน/โครงการพิเศษ',
    amount: 1000000,
    budgetOfficer: 'หัวหน้างบประมาณ',
    approver: 'นายทหารเบิกจ่าย 2',
    status: 'ส่งคืนเอกสารแก้ไข',
    notes: 'TEST-ระบบ',
    returnDate: '9/2/2569',
    transferDate: ''
  },
  {
    id: 'TH003',
    department: 'ทน.4',
    requestDate: '6/2/2569',
    docNumber: '13/69',
    item: 'TEST',
    category: 'งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)',
    amount: 1000000,
    budgetOfficer: 'หัวหน้างบประมาณ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'อนุมัติ',
    notes: 'TEST-ระบบ',
    returnDate: '',
    transferDate: '6/2/2569'
  },
  {
    id: 'TH004',
    department: 'กรม ทพ.42',
    requestDate: '5/2/2569',
    docNumber: '15/69',
    item: 'TEST',
    category: 'งบอุดหนุน/โครงการพิเศษ',
    amount: 1000000,
    budgetOfficer: 'หัวหน้างบประมาณ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'ส่งคืนเอกสารแก้ไข',
    notes: 'TEST-ระบบ',
    returnDate: '9/2/2569',
    transferDate: ''
  },
  {
    id: 'TH005',
    department: 'ฝคง',
    requestDate: '9/2/2569',
    docNumber: '11/69',
    item: 'TEST',
    category: 'งบดำเนินงาน (ค่าตอบแทน ใช้สอย และวัสดุ)',
    amount: 1000000,
    budgetOfficer: 'หัวหน้างบประมาณ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'ส่งคืนเอกสารแก้ไข',
    notes: 'TEST-ระบบ',
    returnDate: '9/2/2569',
    transferDate: ''
  },
  {
    id: 'TH006',
    department: 'บก.มทบ.42',
    requestDate: '1/3/2569',
    docNumber: '84/69',
    item: 'TEST',
    category: 'งบลงทุน (ค่าครุภัณฑ์/ที่ดิน)',
    amount: 1000000,
    budgetOfficer: 'พ.ท.หญิง พจวรรณ จิตรตรง - หัวหน้างบประมาณผู้อนุมัติ',
    approver: 'พ.ท.ภูริทัต ภักดีชน - ฝกง.มทบ.42 -ผู้อนุมัติ',
    status: 'ยื่นเอกสาร',
    notes: 'TEST-ระบบ',
    returnDate: '1/3/2569',
    transferDate: ''
  },
  {
    id: 'TH007',
    department: 'บก.มทบ.42',
    requestDate: '18/4/2569',
    docNumber: '176',
    item: 'ค่าเบี้ยเลี้ยง',
    category: 'งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)',
    amount: 200000,
    budgetOfficer: 'เสมียนงบประมาณ 1-ตรวจสอบ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'ส่งคืนเอกสารแก้ไข',
    notes: 'ขาดใบเสนอราคา ขาดใบส่งของ',
    returnDate: '18/4/2569',
    transferDate: '18/4/2569'
  },
  {
    id: 'TH008',
    department: 'บก.มทบ.42',
    requestDate: '26/5/2569',
    docNumber: '158/69',
    item: 'เบี้ยเลี้ยงเดินทางไปราชการ',
    category: 'งบบุคลากร (เบี้ยเลี้ยง/ค่าตอบแทน/เดินทาง)',
    amount: 720,
    budgetOfficer: 'เสมียนงบประมาณ 1-ตรวจสอบ',
    approver: 'นายทหารเบิกจ่าย 1',
    status: 'รอตรวจสอบเอกสาร',
    notes: 'เอกสาร/ประสานหน่วย',
    returnDate: '26/5/2569',
    transferDate: '27/5/2569'
  }
];

export const MTHB42_LOGO_URL = '/mthb42-logo.jpg';
export const MTHB42_EMBLEM_SVG = `
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFA500" />
      <stop offset="100%" stop-color="#B8860B" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
  </defs>
  <!-- Background Shield/Ring -->
  <circle cx="200" cy="200" r="170" fill="none" stroke="url(#blueGrad)" stroke-width="24" />
  <circle cx="200" cy="200" r="150" fill="none" stroke="#FFFFFF" stroke-width="4" />
  <!-- Thai Wheel / Chakra motif -->
  <g transform="translate(200, 200)">
    <circle r="90" fill="url(#redGrad)" stroke="url(#goldGrad)" stroke-width="12" />
    <circle r="60" fill="none" stroke="#FFFFFF" stroke-dasharray="8 6" stroke-width="6" />
    <!-- Chakra Spokes -->
    <path d="M -90,0 L 90,0 M 0,-90 L 0,90 M -63,-63 L 63,63 M -63,63 L 63,-63" stroke="url(#goldGrad)" stroke-width="8" />
  </g>
  <!-- Swan/Hongsa Crest Head (Hansa) -->
  <path d="M 170 240 Q 150 140 190 70 Q 230 110 240 180 Q 250 210 220 250 Z" fill="url(#goldGrad)" stroke="#B8860B" stroke-width="3" />
  <path d="M 190 70 Q 210 40 230 60 Q 210 80 190 70 Z" fill="url(#redGrad)" />
  <path d="M 170 120 Q 120 120 130 160 Q 140 130 170 130 Z" fill="url(#goldGrad)" />
  <!-- Ribbon Ribbon -->
  <path d="M 70 290 Q 200 370 330 290 L 310 250 Q 200 320 90 250 Z" fill="url(#blueGrad)" stroke="url(#goldGrad)" stroke-width="4" />
  <text x="200" y="305" font-family="'TH Sarabun New', 'Sarabun', sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    มณฑลทหารบกที่ ๔๒
  </text>
</svg>
`;
