import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { MonthlyCharts } from './components/MonthlyCharts';
import { DisbursementTable } from './components/DisbursementTable';
import { AddRequestModal } from './components/AddRequestModal';
import { EditRequestModal } from './components/EditRequestModal';
import { PrintVoucherModal } from './components/PrintVoucherModal';

import { DisbursementItem, DisbursementStatus, MonthlySummary, CategorySummary, DepartmentSummary } from './types';
import { exportToExcel, exportToPdf } from './utils/exportUtils';
import { 
  subscribeToDisbursements, 
  subscribeAppLogo,
  saveDisbursementDoc, 
  updateDisbursementDoc, 
  deleteDisbursementDoc 
} from './firebase';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [rawItems, setRawItems] = useState<DisbursementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DisbursementItem | null>(null);
  const [printingItem, setPrintingItem] = useState<DisbursementItem | null>(null);

  // Google Drive & Sheets
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSpreadsheetUrl, setLastSpreadsheetUrl] = useState<string | undefined>();

  // Show Toast Notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Subscribe to Firestore Real-Time Data & Logo Configuration
  useEffect(() => {
    setIsLoading(true);
    const unsubDisbursements = subscribeToDisbursements(
      (data) => {
        setRawItems(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore loading error:', err);
        showToast('ไม่สามารถเชื่อมต่อข้อมูล Firestore ได้', 'error');
        setIsLoading(false);
      }
    );

    const unsubLogo = subscribeAppLogo((logoUrl) => {
      // Sync logo URL if needed across components or state
      console.log('Firebase mtb42-6bea7 Logo synced:', logoUrl ? 'OK' : 'Empty');
    });

    return () => {
      unsubDisbursements();
      unsubLogo();
    };
  }, []);

  // Compute Stats dynamically from raw Firestore items
  const stats = useMemo(() => {
    const totalAmount = rawItems.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const approvedItems = rawItems.filter(d => d.status === 'อนุมัติ' || d.status === 'โอนเงินแล้ว');
    const approvedAmount = approvedItems.reduce((sum, d) => sum + (d.amount || 0), 0);

    const pendingItems = rawItems.filter(d => d.status === 'ยื่นเอกสาร' || d.status === 'รอตรวจสอบเอกสาร');
    const pendingAmount = pendingItems.reduce((sum, d) => sum + (d.amount || 0), 0);

    const returnedItems = rawItems.filter(d => d.status === 'ส่งคืนเอกสารแก้ไข');
    const returnedAmount = returnedItems.reduce((sum, d) => sum + (d.amount || 0), 0);

    const thaiMonths: Record<string, string> = {
      '01': 'มกราคม', '02': 'กุมภาพันธ์', '03': 'มีนาคม', '04': 'เมษายน',
      '05': 'พฤษภาคม', '06': 'มิถุนายน', '07': 'กรกฎาคม', '08': 'สิงหาคม',
      '09': 'กันยายน', '10': 'ตุลาคม', '11': 'พฤศจิกายน', '12': 'ธันวาคม'
    };

    const monthlyMap: Record<string, MonthlySummary> = {};
    rawItems.forEach(item => {
      const parts = (item.requestDate || '').split('/');
      if (parts.length === 3) {
        const m = parts[1].padStart(2, '0');
        const y = parseInt(parts[2]) || 2569;
        const key = `${m}/${y}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            monthYear: key,
            monthName: thaiMonths[m] || `เดือน ${m}`,
            yearBE: y,
            totalAmount: 0,
            approvedAmount: 0,
            pendingAmount: 0,
            returnedAmount: 0,
            count: 0
          };
        }
        monthlyMap[key].totalAmount += item.amount || 0;
        monthlyMap[key].count += 1;
        if (item.status === 'อนุมัติ' || item.status === 'โอนเงินแล้ว') {
          monthlyMap[key].approvedAmount += item.amount || 0;
        } else if (item.status === 'ยื่นเอกสาร' || item.status === 'รอตรวจสอบเอกสาร') {
          monthlyMap[key].pendingAmount += item.amount || 0;
        } else if (item.status === 'ส่งคืนเอกสารแก้ไข') {
          monthlyMap[key].returnedAmount += item.amount || 0;
        }
      }
    });

    const categoryMap: Record<string, { category: string; amount: number; count: number }> = {};
    rawItems.forEach(item => {
      const cat = item.category || 'อื่นๆ';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, amount: 0, count: 0 };
      }
      categoryMap[cat].amount += item.amount || 0;
      categoryMap[cat].count += 1;
    });

    const categoryList: CategorySummary[] = Object.values(categoryMap).map(c => ({
      ...c,
      percentage: totalAmount > 0 ? (c.amount / totalAmount) * 100 : 0
    }));

    const deptMap: Record<string, { department: string; totalAmount: number; approvedAmount: number; returnedCount: number; pendingCount: number }> = {};
    rawItems.forEach(item => {
      const dept = item.department || 'ไม่ระบุ';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalAmount: 0, approvedAmount: 0, returnedCount: 0, pendingCount: 0 };
      }
      deptMap[dept].totalAmount += item.amount || 0;
      if (item.status === 'อนุมัติ' || item.status === 'โอนเงินแล้ว') {
        deptMap[dept].approvedAmount += item.amount || 0;
      } else if (item.status === 'ส่งคืนเอกสารแก้ไข') {
        deptMap[dept].returnedCount += 1;
      } else if (item.status === 'ยื่นเอกสาร' || item.status === 'รอตรวจสอบเอกสาร') {
        deptMap[dept].pendingCount += 1;
      }
    });

    const departmentList: DepartmentSummary[] = Object.values(deptMap);

    return {
      totalAmount,
      approvedAmount,
      pendingAmount,
      returnedAmount,
      totalCount: rawItems.length,
      approvedCount: approvedItems.length,
      pendingCount: pendingItems.length,
      returnedCount: returnedItems.length,
      monthlyList: Object.values(monthlyMap),
      categoryList,
      departmentList
    };
  }, [rawItems]);

  // Compute Filtered Items for Display
  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          (item.id || '').toLowerCase().includes(q) ||
          (item.docNumber || '').toLowerCase().includes(q) ||
          (item.item || '').toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (selectedDept !== 'ALL' && item.department !== selectedDept) {
        return false;
      }

      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      if (selectedMonth !== 'ALL') {
        const parts = (item.requestDate || '').split('/');
        if (parts.length === 3) {
          const m = parts[1].padStart(2, '0');
          const y = parts[2];
          if (`${m}/${y}` !== selectedMonth) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [rawItems, searchTerm, selectedDept, selectedStatus, selectedCategory, selectedMonth]);

  // Check Google OAuth status
  const checkGoogleAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/google/status');
      const data = await res.json();
      setIsGoogleConnected(data.connected);
    } catch (e) {
      setIsGoogleConnected(false);
    }
  }, []);

  useEffect(() => {
    checkGoogleAuth();
  }, [checkGoogleAuth]);

  // Handle Google OAuth Connect
  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(data.url, 'GoogleOAuth', `width=${width},height=${height},top=${top},left=${left}`);
      }
    } catch (err) {
      showToast('ไม่สามารถเริ่มขั้นตอนเชื่อมต่อ Google Drive ได้', 'error');
    }
  };

  // Listener for OAuth message from callback window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        setIsGoogleConnected(true);
        showToast('เชื่อมต่อ Google Drive & Sheets สำเร็จแล้ว!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle Export to Google Sheets
  const handleExportToGoogleSheets = async () => {
    if (!isGoogleConnected) {
      handleConnectGoogle();
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch('/api/google/export-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setLastSpreadsheetUrl(data.spreadsheetUrl);
        showToast('ส่งออกข้อมูลลง Google Sheets ใน Google Drive เรียบร้อยแล้ว!');
      } else {
        showToast(data.error || 'การส่งออกล้มเหลว', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดขณะส่งออกข้อมูล', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Disconnect Google
  const handleDisconnectGoogle = async () => {
    await fetch('/api/auth/google/logout', { method: 'POST' });
    setIsGoogleConnected(false);
    setLastSpreadsheetUrl(undefined);
    showToast('ยกเลิกการเชื่อมต่อ Google Drive เรียบร้อย');
  };

  // Add Disbursement Request to Firestore
  const handleAddRequest = async (newItem: DisbursementItem) => {
    try {
      let finalItem = { ...newItem };
      if (!finalItem.id) {
        const maxId = rawItems.reduce((max, item) => {
          const num = parseInt((item.id || '').replace(/\D/g, '')) || 0;
          return num > max ? num : max;
        }, 0);
        finalItem.id = `TH${String(maxId + 1).padStart(3, '0')}`;
      }

      await saveDisbursementDoc(finalItem);
      showToast(`บันทึกคำขอเบิกจ่าย #${finalItem.id} เข้า Firestore สำเร็จ!`);
    } catch (err) {
      console.error('Add request error:', err);
      showToast('บันทึกข้อมูลเข้า Firestore ล้มเหลว', 'error');
    }
  };

  // Edit Disbursement Request in Firestore
  const handleSaveEdit = async (updatedItem: DisbursementItem) => {
    try {
      await saveDisbursementDoc(updatedItem);
      showToast(`อัปเดตข้อมูลคำขอ #${updatedItem.id} ใน Firestore เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Save edit error:', err);
      showToast('เกิดข้อผิดพลาดในการแก้ไขข้อมูลใน Firestore', 'error');
    }
  };

  // Delete Disbursement Request from Firestore
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำขอเบิกจ่าย #${id} จาก Firestore?`)) {
      return;
    }
    try {
      await deleteDisbursementDoc(id);
      showToast(`ลบรายการ #${id} จาก Firestore เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Delete request error:', err);
      showToast('ไม่สามารถลบรายการจาก Firestore ได้', 'error');
    }
  };

  // Quick Status Update in Firestore
  const handleQuickStatusUpdate = async (id: string, newStatus: DisbursementStatus) => {
    try {
      await updateDisbursementDoc(id, { status: newStatus });
      showToast(`ปรับสถานะ #${id} เป็น "${newStatus}" ใน Firestore เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Status update error:', err);
      showToast('ไม่สามารถเปลี่ยนสถานะใน Firestore ได้', 'error');
    }
  };

  // Unique Month Options for Filter
  const monthOptions = [
    { label: 'มกราคม 2569 (01/2569)', value: '01/2569' },
    { label: 'กุมภาพันธ์ 2569 (02/2569)', value: '02/2569' },
    { label: 'มีนาคม 2569 (03/2569)', value: '03/2569' },
    { label: 'เมษายน 2569 (04/2569)', value: '04/2569' },
    { label: 'พฤษภาคม 2569 (05/2569)', value: '05/2569' },
    { label: 'มิถุนายน 2569 (06/2569)', value: '06/2569' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-white flex flex-col lg:flex-row">
      
      {/* Left Sidebar Menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportToDrive={handleExportToGoogleSheets}
        onExportExcel={() => exportToExcel(filteredItems)}
        onExportPdf={() => exportToPdf(filteredItems)}
        onRefresh={() => {}}
        isGoogleConnected={isGoogleConnected}
        isExporting={isExporting}
        isLoading={isLoading}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onExportToDrive={handleExportToGoogleSheets}
          onRefresh={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isGoogleConnected={isGoogleConnected}
          isExporting={isExporting}
          isLoading={isLoading}
        />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Toast Notification */}
          {notification && (
            <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-3 transition-all animate-bounce ${
              notification.type === 'success' ? 'bg-emerald-600 border border-emerald-400' : 'bg-rose-600 border border-rose-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* 1. Real-Time Metric Cards */}
          <div id="dashboard">
            <MetricsCards stats={stats} />
          </div>

          {/* 2. Complete Disbursement Data Table */}
          <div id="table">
            <DisbursementTable
              items={filteredItems}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              selectedDept={selectedDept}
              onDeptChange={setSelectedDept}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onEditItem={setEditingItem}
              onDeleteItem={handleDeleteRequest}
              onPrintVoucher={setPrintingItem}
              onQuickUpdateStatus={handleQuickStatusUpdate}
              monthOptions={monthOptions}
            />
          </div>

          {/* 3. Real-Time Monthly & Categorized Charts */}
          <div id="charts">
            <MonthlyCharts
              monthlyData={stats.monthlyList}
              categoryData={stats.categoryList}
              departmentData={stats.departmentList}
            />
          </div>

        </main>
      </div>

      {/* Modals */}
      <AddRequestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRequest}
      />

      <EditRequestModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      <PrintVoucherModal
        isOpen={Boolean(printingItem)}
        item={printingItem}
        onClose={() => setPrintingItem(null)}
      />

    </div>
  );
}
