import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { MonthlyCharts } from './components/MonthlyCharts';
import { DisbursementTable } from './components/DisbursementTable';
import { AddRequestModal } from './components/AddRequestModal';
import { EditRequestModal } from './components/EditRequestModal';
import { PrintVoucherModal } from './components/PrintVoucherModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AuthModal } from './components/AuthModal';
import { SystemManagement } from './components/SystemManagement';
import { PermissionsManagement } from './components/PermissionsManagement';
import { LoginHistoryManagement } from './components/LoginHistoryManagement';
import { IdleTimeoutWarningModal } from './components/IdleTimeoutWarningModal';

import { DisbursementItem, DisbursementStatus, MonthlySummary, CategorySummary, DepartmentSummary, UserProfile, FeatureFlags, DEFAULT_FEATURE_FLAGS, DEFAULT_BUDGET_CATEGORIES, DEFAULT_BUDGET_OFFICERS, DEFAULT_APPROVERS, DEFAULT_DOC_AUDIT_STATUSES, DEFAULT_DISBURSEMENT_STATUSES } from './types';
import { exportToExcel, exportToPdf } from './utils/exportUtils';
import { 
  subscribeToDisbursements, 
  subscribeAppLogo,
  subscribeAppConfig,
  saveAppConfig,
  SystemSettingsDoc,
  saveDisbursementDoc, 
  updateDisbursementDoc, 
  deleteDisbursementDoc,
  subscribeAuthState,
  logoutUserWithFirebase,
  subscribeAllUsers
} from './firebase';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [systemSubTab, setSystemSubTab] = useState<string>('logo');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [rawItems, setRawItems] = useState<DisbursementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // User Auth & Role State
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');

  // Admin Role Lock & Permission State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('mthb42_admin_pass') || 'admin123';
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Auto Logout / Idle Security State
  const [idleMinutesSetting, setIdleMinutesSetting] = useState<number>(() => {
    const saved = localStorage.getItem('mthb42_idle_minutes');
    return saved ? parseInt(saved, 10) : 30; // Default 30 minutes
  });
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [remainingIdleSeconds, setRemainingIdleSeconds] = useState(120);
  const [currentIdleSecondsLeft, setCurrentIdleSecondsLeft] = useState<number>(idleMinutesSetting * 60);
  const lastActivityRef = React.useRef<number>(Date.now());

  const handleUpdateIdleMinutes = (minutes: number) => {
    setIdleMinutesSetting(minutes);
    localStorage.setItem('mthb42_idle_minutes', minutes.toString());
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('mthb42_admin_pass', newPass);
  };

  // Dynamic App Config State (Categories, Departments & Officers)
  // System Configuration & Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_BUDGET_CATEGORIES);
  const [departments, setDepartments] = useState<string[]>([
    'บก.มทบ.42',
    'กรม ทพ.42',
    'ทน.4',
    'ฝคง.มทบ.42',
    'ฝพ.มทบ.42',
    'ฝกพ.มทบ.42',
    'ฝกห.มทบ.42',
    'ร.5 พัน.1'
  ]);
  const [budgetOfficers, setBudgetOfficers] = useState<string[]>(DEFAULT_BUDGET_OFFICERS);
  const [approvers, setApprovers] = useState<string[]>(DEFAULT_APPROVERS);
  const [docAuditStatuses, setDocAuditStatuses] = useState<string[]>(DEFAULT_DOC_AUDIT_STATUSES);
  const [disbursementStatuses, setDisbursementStatuses] = useState<string[]>(DEFAULT_DISBURSEMENT_STATUSES);
  const [systemConfig, setSystemConfig] = useState<SystemSettingsDoc>({});

  // Subscribe to Auth State, All Users List, Disbursements & Config
  useEffect(() => {
    const unsubscribeAuth = subscribeAuthState((profile) => {
      setCurrentUserProfile(profile);
      if (profile?.role === 'ADMIN') {
        setIsAdmin(true);
      }
      if (!profile) {
        setIsAuthModalOpen(true);
      }
    });

    const unsubscribeUsers = subscribeAllUsers((usersList) => {
      setAllUsers(usersList);
    });

    const unsubscribeDisbursements = subscribeToDisbursements(
      (items) => {
        setRawItems(items);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
      }
    );

    const unsubscribeConfig = subscribeAppConfig((cfg) => {
      setSystemConfig(cfg);
      if (cfg.categoryList && cfg.categoryList.length > 0) {
        setCategories(cfg.categoryList);
      }
      if (cfg.departmentList && cfg.departmentList.length > 0) {
        setDepartments(cfg.departmentList);
      }
      if (cfg.budgetOfficerList && cfg.budgetOfficerList.length > 0) {
        setBudgetOfficers(cfg.budgetOfficerList);
      }
      if (cfg.approverList && cfg.approverList.length > 0) {
        setApprovers(cfg.approverList);
      }
      if (cfg.docAuditStatusList && cfg.docAuditStatusList.length > 0) {
        setDocAuditStatuses(cfg.docAuditStatusList);
      }
      if (cfg.statusList && cfg.statusList.length > 0) {
        setDisbursementStatuses(cfg.statusList);
      }
      if (cfg.featureFlags) {
        setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...cfg.featureFlags });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
      unsubscribeDisbursements();
      unsubscribeConfig();
    };
  }, []);

  const isUserAdmin = Boolean(isAdmin || currentUserProfile?.role === 'ADMIN');

  // Guard admin tabs for non-admin users
  useEffect(() => {
    if (!isUserAdmin && (activeTab === 'system' || activeTab === 'login-history' || activeTab === 'loginHistory' || activeTab === 'permissions')) {
      setActiveTab('table');
    }
  }, [isUserAdmin, activeTab]);

  const handleOpenAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUserProfile(profile);
    if (profile.role === 'ADMIN') {
      setIsAdmin(true);
    }
    setIsAuthModalOpen(false);
    showToast(`เข้าสู่ระบบในนาม ${profile.displayName} (${profile.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'})`, 'success');
  };

  const handleLogout = async () => {
    await logoutUserWithFirebase();
    setCurrentUserProfile(null);
    setIsAdmin(false);
    setShowIdleWarning(false);
    setIsAuthModalOpen(true);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
  };

  // Idle Timeout / Auto Logout Listener Effect
  useEffect(() => {
    if (!currentUserProfile && !isAdmin) {
      setShowIdleWarning(false);
      return;
    }
    if (idleMinutesSetting <= 0) return; // 0 = Disabled

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      setCurrentIdleSecondsLeft(idleMinutesSetting * 60);
      setShowIdleWarning(false);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'pointermove'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    const checkInterval = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const timeoutMs = idleMinutesSetting * 60 * 1000;
      const warningWindowMs = 2 * 60 * 1000; // Show warning when 2 mins remain
      const remSec = Math.max(0, Math.ceil((timeoutMs - elapsedMs) / 1000));

      setCurrentIdleSecondsLeft(remSec);

      if (elapsedMs >= timeoutMs) {
        setShowIdleWarning(false);
        handleLogout();
        showToast(`ระบบตัดการเชื่อมต่อและออกจากระบบอัตโนมัติ เนื่องจากไม่มีการใช้งานเป็นเวลา ${idleMinutesSetting} นาที`, 'error');
      } else if (elapsedMs >= timeoutMs - warningWindowMs) {
        const remaining = Math.max(0, Math.ceil((timeoutMs - elapsedMs) / 1000));
        setRemainingIdleSeconds(remaining);
        setShowIdleWarning(true);
      } else {
        setShowIdleWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
      clearInterval(checkInterval);
    };
  }, [currentUserProfile, isAdmin, idleMinutesSetting]);


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
  const [deletingDisbursementId, setDeletingDisbursementId] = useState<string | null>(null);

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

  // Admin Auth Handlers
  const handleUnlockAdmin = (inputPassword: string) => {
    if (inputPassword === adminPassword) {
      setIsAdmin(true);
      showToast('ปลดล็อกสิทธิ์ผู้ดูแลระบบ (Admin) เรียบร้อยแล้ว');
      return true;
    }
    return false;
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    showToast('สลับเข้าสู่โหมดผู้ใช้ทั่วไป (อ่านอย่างเดียว)');
  };

  const handleChangeAdminPassword = (oldPass: string, newPass: string) => {
    if (oldPass === adminPassword) {
      setAdminPassword(newPass);
      localStorage.setItem('mthb42_admin_pass', newPass);
      showToast('เปลี่ยนรหัสผ่าน Admin เรียบร้อยแล้ว');
      return true;
    }
    return false;
  };

  const handleAttemptAddModal = () => {
    const canCreate = isAdmin
      ? (featureFlags.createDisbursementAdmin ?? true)
      : (featureFlags.createDisbursementUser ?? true);

    if (!canCreate) {
      showToast('ฟังก์ชั่นยื่นคำขอตั้งเบิกถูกปิดใช้งานชั่วคราวโดยผู้ดูแลระบบ', 'error');
      return;
    }
    setIsAddModalOpen(true);
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

    const pendingItems = rawItems.filter(d => d.status === 'ยื่นเอกสาร' || d.status === 'รอตรวจสอบเอกสาร' || d.status === 'ตรวจสอบเอกสารเรียบร้อย');
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
        } else if (item.status === 'ยื่นเอกสาร' || item.status === 'รอตรวจสอบเอกสาร' || item.status === 'ตรวจสอบเอกสารเรียบร้อย') {
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
      } else if (item.status === 'ยื่นเอกสาร' || item.status === 'รอตรวจสอบเอกสาร' || item.status === 'ตรวจสอบเอกสารเรียบร้อย') {
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
      let finalItem: DisbursementItem = { 
        ...newItem,
        status: newItem.status || 'ยื่นเอกสาร'
      };
      if (!finalItem.id) {
        const maxId = rawItems.reduce((max, item) => {
          const num = parseInt((item.id || '').replace(/\D/g, '')) || 0;
          return num > max ? num : max;
        }, 0);
        finalItem.id = `TH${String(maxId + 1).padStart(3, '0')}`;
      }

      await saveDisbursementDoc(finalItem);
      showToast(`บันทึกคำขอเบิกจ่าย #${finalItem.id} เข้า Firestore สำเร็จ! (สถานะ: ${finalItem.status})`);
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
  const handleDeleteRequest = (id: string) => {
    setDeletingDisbursementId(id);
  };

  const handleConfirmDeleteRequest = async () => {
    if (!deletingDisbursementId) return;
    const targetId = deletingDisbursementId;
    try {
      await deleteDisbursementDoc(targetId);
      showToast(`ลบรายการ #${targetId} จาก Firestore เรียบร้อยแล้ว`);
      setDeletingDisbursementId(null);
    } catch (err) {
      console.error('Delete request error:', err);
      showToast('ไม่สามารถลบรายการจาก Firestore ได้', 'error');
    }
  };

  // Quick Status Update in Firestore
  const handleQuickStatusUpdate = async (id: string, newStatus: DisbursementStatus, field: 'status' | 'docAuditStatus' = 'status') => {
    try {
      if (field === 'docAuditStatus') {
        await updateDisbursementDoc(id, { docAuditStatus: newStatus });
        showToast(`ปรับสถานะการตรวจสอบเอกสาร #${id} เป็น "${newStatus}" เรียบร้อยแล้ว`);
      } else {
        await updateDisbursementDoc(id, { status: newStatus });
        showToast(`ปรับสถานะคำขอเบิกจ่าย #${id} เป็น "${newStatus}" เรียบร้อยแล้ว`);
      }
    } catch (err) {
      console.error('Status update error:', err);
      showToast('ไม่สามารถเปลี่ยนสถานะใน Firestore ได้', 'error');
    }
  };

  // Update Status Options List in Firestore Config
  const handleUpdateDocAuditStatuses = async (newList: string[]) => {
    setDocAuditStatuses(newList);
    try {
      await saveAppConfig({ ...systemConfig, docAuditStatusList: newList });
      showToast('บันทึกปรับปรุงหัวข้อสถานะการตรวจสอบเอกสารเรียบร้อย', 'success');
    } catch (err) {
      console.error('Save docAuditStatusList error:', err);
      showToast('ไม่สามารถบันทึกหัวข้อสถานะได้', 'error');
    }
  };

  const handleUpdateDisbursementStatuses = async (newList: string[]) => {
    setDisbursementStatuses(newList);
    try {
      await saveAppConfig({ ...systemConfig, statusList: newList });
      showToast('บันทึกปรับปรุงหัวข้อสถานะการเบิกจ่ายเรียบร้อย', 'success');
    } catch (err) {
      console.error('Save statusList error:', err);
      showToast('ไม่สามารถบันทึกหัวข้อสถานะได้', 'error');
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
        activeSystemSubTab={systemSubTab}
        onSelectSystemSubTab={setSystemSubTab}
        onOpenAddModal={handleAttemptAddModal}
        onExportToDrive={handleExportToGoogleSheets}
        onExportExcel={() => exportToExcel(filteredItems)}
        onExportPdf={() => exportToPdf(filteredItems)}
        onRefresh={() => {}}
        isGoogleConnected={isGoogleConnected}
        isExporting={isExporting}
        isLoading={isLoading}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isAdmin={isAdmin}
        onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
        currentUserProfile={currentUserProfile}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header
          onOpenAddModal={handleAttemptAddModal}
          onExportToDrive={handleExportToGoogleSheets}
          onRefresh={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isGoogleConnected={isGoogleConnected}
          isExporting={isExporting}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
          currentUserProfile={currentUserProfile}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          idleMinutesSetting={idleMinutesSetting}
          idleSecondsLeft={currentIdleSecondsLeft}
        />


        {/* Main Content Container */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
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

          {/* Conditional View Rendering based on activeTab */}
          {activeTab === 'system' ? (
            <SystemManagement 
              isAdmin={isAdmin}
              currentUserProfile={currentUserProfile}
              adminPassword={adminPassword}
              onUpdateAdminPassword={handleUpdateAdminPassword}
              showToast={showToast}
              disbursementsCount={rawItems.length}
              usersCount={allUsers.length}
              idleMinutesSetting={idleMinutesSetting}
              onUpdateIdleMinutes={handleUpdateIdleMinutes}
              activeSubTab={systemSubTab}
              onSelectSubTab={setSystemSubTab}
            />
          ) : (activeTab === 'login-history' || activeTab === 'loginHistory') ? (
            <LoginHistoryManagement
              isAdmin={isAdmin || currentUserProfile?.role === 'ADMIN'}
              departments={departments}
              showToast={showToast}
            />
          ) : activeTab === 'permissions' ? (
            <PermissionsManagement 
              isAdmin={isAdmin || currentUserProfile?.role === 'ADMIN'}
              currentUserProfile={currentUserProfile}
              showToast={showToast}
              onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
            />
          ) : activeTab === 'charts' ? (
            <div id="charts">
              <MonthlyCharts
                monthlyData={stats.monthlyList}
                categoryData={stats.categoryList}
                departmentData={stats.departmentList}
              />
            </div>
          ) : (
            <>
              {/* Disbursement Data Table */}
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
                  isAdmin={isUserAdmin}
                  onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
                  onOpenAddModal={handleAttemptAddModal}
                  categoryList={categories}
                  departmentList={departments}
                  docAuditStatusList={docAuditStatuses}
                  statusList={disbursementStatuses}
                  onUpdateDocAuditStatusList={handleUpdateDocAuditStatuses}
                  onUpdateDisbursementStatusList={handleUpdateDisbursementStatuses}
                  featureFlags={featureFlags}
                />
              </div>
            </>
          )}

        </main>
      </div>

      {/* Modals */}
      <AddRequestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRequest}
        categories={categories}
        departmentList={departments}
        budgetOfficers={budgetOfficers}
        approvers={approvers}
        docAuditStatusList={docAuditStatuses}
        statusList={disbursementStatuses}
      />

      <EditRequestModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        categories={categories}
        departmentList={departments}
        budgetOfficers={budgetOfficers}
        approvers={approvers}
        docAuditStatusList={docAuditStatuses}
        statusList={disbursementStatuses}
      />

      <PrintVoucherModal
        isOpen={Boolean(printingItem)}
        item={printingItem}
        onClose={() => setPrintingItem(null)}
      />

      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        isAdmin={isAdmin}
        onUnlock={handleUnlockAdmin}
        onLock={handleLockAdmin}
        onChangePassword={handleChangeAdminPassword}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalInitialTab}
        adminPassword={adminPassword}
      />

      <IdleTimeoutWarningModal
        isOpen={showIdleWarning}
        remainingSeconds={remainingIdleSeconds}
        idleMinutes={idleMinutesSetting}
        onContinue={() => {
          lastActivityRef.current = Date.now();
          setShowIdleWarning(false);
          showToast('ต่ออายุการเข้าใช้งานเรียบร้อยแล้ว', 'success');
        }}
        onLogoutNow={handleLogout}
      />

      {/* Modal: Confirm Delete Disbursement Request */}
      {deletingDisbursementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบรายการฎีกา</h3>
              <p className="text-xs text-slate-600 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบคำขอเบิกจ่าย <span className="font-bold text-slate-900">#{deletingDisbursementId}</span> ออกจากฐานข้อมูล?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDisbursementId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRequest}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

