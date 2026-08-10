import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DisbursementItem } from '../types';
import { MTHB42_LOGO_URL } from '../data/initialData';

/**
 * Helper to format Thai Currency
 */
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

/**
 * Export disbursement items to Excel (.xlsx) file
 */
export const exportToExcel = (items: DisbursementItem[], customFileName?: string) => {
  const currentDateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate Total
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Prepare Worksheet Data Rows
  const sheetData = [
    ['รายงานการติดตามการเบิกจ่ายงบประมาณ มณฑลทหารบกที่ ๔๒'],
    [`กองทัพบก • ค่ายเสนานารงค์ อำเภอหาดใหญ่ จังหวัดสงขลา (ข้อมูล ณ วันที่ ${currentDateStr})`],
    [], // Empty row separator
    [
      'ลำดับ',
      'เลขที่คำขอ',
      'หน่วยตั้งเบิก',
      'วันที่ตั้งเบิก',
      'เลขที่ฎีกา',
      'รายการเบิกจ่าย',
      'ประเภทงบประมาณ',
      'จำนวนเงิน (บาท)',
      'ฝ่ายงบประมาณ',
      'สถานะการตรวจสอบเอกสาร',
      'นายทหารเบิกจ่าย (ฝ่ายอนุมัติ)',
      'สถานะการเบิกจ่าย',
      'หมายเหตุ / วันที่โอน/ส่งคืน'
    ],
    ...items.map((item, index) => {
      const execDate = item.status === 'โอนเงินแล้ว' && item.transferDate ? `(โอน: ${item.transferDate})` :
                      item.status === 'ส่งคืนเอกสารแก้ไข' && item.returnDate ? `(ส่งคืน: ${item.returnDate})` : '';
      const docAuditStatus = item.status === 'ตรวจสอบเอกสารเรียบร้อย' || item.status === 'อนุมัติ' || item.status === 'โอนเงินแล้ว' ? 'ตรวจสอบเอกสารเรียบร้อย' :
                             item.status === 'รอตรวจสอบเอกสาร' ? 'รอตรวจสอบเอกสาร' :
                             item.status === 'ยื่นเอกสาร' ? 'ยื่นเอกสาร' :
                             item.status === 'ส่งคืนเอกสารแก้ไข' ? 'ส่งคืนเอกสารแก้ไข' : item.status;
      return [
        index + 1,
        item.id || '-',
        item.department || '-',
        item.requestDate || '-',
        item.docNumber || '-',
        item.item || '-',
        item.category || '-',
        item.amount || 0,
        item.budgetOfficer || '-',
        docAuditStatus,
        item.approver || '-',
        item.status || '-',
        `${item.notes || ''} ${execDate}`.trim()
      ];
    }),
    [], // Empty row
    [
      'รวมงบประมาณตั้งเบิกทั้งสิ้น',
      '',
      '',
      '',
      '',
      '',
      '',
      totalAmount,
      '',
      '',
      `จำนวน ${items.length} รายการ`,
      ''
    ]
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 15 }, // เลขที่คำขอ
    { wch: 18 }, // หน่วยตั้งเบิก
    { wch: 15 }, // วันที่ตั้งเบิก
    { wch: 15 }, // เลขที่ฎีกา
    { wch: 35 }, // รายการ
    { wch: 30 }, // ประเภทงบประมาณ
    { wch: 18 }, // จำนวนเงิน
    { wch: 20 }, // ฝ่ายงบประมาณ
    { wch: 24 }, // สถานะการตรวจสอบเอกสาร
    { wch: 22 }, // นายทหารเบิกจ่าย
    { wch: 20 }, // สถานะ
    { wch: 30 }, // หมายเหตุ
  ];

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานเบิกจ่ายงบประมาณ');

  // Generate filename
  const fileName = customFileName || `รายงานการเบิกจ่ายงบประมาณ_มทบ42_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Save Excel file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export disbursement items to PDF (.pdf) document with full Thai font support
 */
export const exportToPdf = async (items: DisbursementItem[], customTitle?: string) => {
  const currentDateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Create temporary container for PDF rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '1050px'; // A4 Landscape width ratio
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '32px';
  container.style.fontFamily = "'Sarabun', 'TH Sarabun New', sans-serif";
  container.style.color = '#0f172a';

  // Build Official Report HTML Content
  container.innerHTML = `
    <div style="border: 2px solid #cbd5e1; padding: 24px; border-radius: 8px; background: #ffffff;">
      <!-- Header Section -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #b45309; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${MTHB42_LOGO_URL}" style="width: 70px; height: 70px; object-fit: contain;" />
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #b45309; text-transform: uppercase;">กองทัพบก • มณฑลทหารบกที่ ๔๒ (ค่ายเสนานารงค์)</div>
            <h1 style="font-size: 22px; font-weight: bold; color: #0f172a; margin: 2px 0 0 0;">${customTitle || 'รายงานติดตามสถานะการเบิกจ่ายงบประมาณ'}</h1>
            <div style="font-size: 13px; color: #475569;">อ.หาดใหญ่ จ.สงขลา | ข้อมูลสรุป ณ วันที่ ${currentDateStr} น.</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: bold; background-color: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; border: 1px solid #fde68a;">
            รวมเบิกทั้งสิ้น: ${formatCurrency(totalAmount)}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">จำนวนรวม ${items.length} รายการ</div>
        </div>
      </div>

      <!-- Table Section -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
        <thead>
          <tr style="background-color: #1e293b; color: #ffffff; font-weight: bold;">
            <th style="padding: 8px 6px; border: 1px solid #334155; text-align: center; width: 40px;">ลำดับ</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; width: 80px;">เลขคำขอ</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; width: 90px;">หน่วยตั้งเบิก</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; width: 80px;">วันตั้งเบิก</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; width: 75px;">เลขฎีกา</th>
            <th style="padding: 8px 6px; border: 1px solid #334155;">รายการ / ประเภทงบประมาณ</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; text-align: right; width: 100px;">ยอดเงิน (บาท)</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; width: 110px;">ฝ่ายงบ / อนุมัติ</th>
            <th style="padding: 8px 6px; border: 1px solid #334155; text-align: center; width: 95px;">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${index + 1}</td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${item.id}</td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1;">${item.department}</td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1;">${item.requestDate}</td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1;">${item.docNumber || '-'}</td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1;">
                <div style="font-weight: bold; color: #0f172a;">${item.item}</div>
                <div style="font-size: 10px; color: #64748b;">${item.category}</div>
              </td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #047857;">
                ${formatCurrency(item.amount)}
              </td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 10px;">
                <div>งบ: ${item.budgetOfficer}</div>
                <div style="color: #475569;">อนุมัติ: ${item.approver}</div>
              </td>
              <td style="padding: 7px 6px; border: 1px solid #cbd5e1; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; ${
                  item.status === 'อนุมัติ' ? 'background: #d1fae5; color: #065f46;' :
                  item.status === 'โอนเงินแล้ว' ? 'background: #dcfce7; color: #166534;' :
                  item.status === 'ส่งคืนเอกสารแก้ไข' ? 'background: #ffe4e6; color: #9f1239;' :
                  item.status === 'รอตรวจสอบเอกสาร' ? 'background: #fef3c7; color: #92400e;' :
                  item.status === 'ตรวจสอบเอกสารเรียบร้อย' ? 'background: #e0e7ff; color: #3730a3;' :
                  'background: #e2e8f0; color: #334155;'
                }">
                  ${item.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a;">
            <td colspan="6" style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: right;">รวมงบประมาณสุทธิ (${items.length} รายการ):</td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: right; color: #047857; font-size: 13px;">${formatCurrency(totalAmount)}</td>
            <td colspan="2" style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 10px;">มณฑลทหารบกที่ ๔๒</td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer Signature Line -->
      <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; color: #334155;">
        <div style="text-align: center; width: 220px;">
          <div>ลงชื่อ.......................................................</div>
          <div style="margin-top: 4px; font-weight: bold;">( เจ้าหน้าที่จัดทำรายงาน )</div>
        </div>
        <div style="text-align: center; width: 220px;">
          <div>ลงชื่อ.......................................................</div>
          <div style="margin-top: 4px; font-weight: bold;">( หัวหน้าฝ่ายงบประมาณ มทบ.๔๒ )</div>
        </div>
        <div style="text-align: center; width: 220px;">
          <div>ลงชื่อ.......................................................</div>
          <div style="margin-top: 4px; font-weight: bold;">( นายทหารเบิกจ่าย มทบ.๔๒ )</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`รายงานการเบิกจ่ายงบประมาณ_มทบ42_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
};
