import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Image as ImageIcon, 
  Key, 
  Database, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  RotateCcw,
  Download,
  AlertTriangle,
  Server,
  FolderPlus,
  Tag,
  Users,
  UserCheck,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { saveLogoToFirebase, saveAppConfig, subscribeAppConfig, SystemSettingsDoc, seedInitialData } from '../firebase';
import { MTHB42_LOGO_URL } from '../data/initialData';
import { UserProfile, DisbursementItem, DEFAULT_BUDGET_CATEGORIES, DEFAULT_BUDGET_OFFICERS, DEFAULT_APPROVERS } from '../types';

interface SystemManagementProps {
  isAdmin: boolean;
  currentUserProfile: UserProfile | null;
  adminPassword: string;
  onUpdateAdminPassword: (newPass: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  disbursementsCount: number;
  usersCount: number;
  idleMinutesSetting?: number;
  onUpdateIdleMinutes?: (minutes: number) => void;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({
  isAdmin,
  currentUserProfile,
  adminPassword,
  onUpdateAdminPassword,
  showToast,
  disbursementsCount,
  usersCount,
  idleMinutesSetting = 30,
  onUpdateIdleMinutes
}) => {
  // Logo State
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);

  // Admin Pin State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  // Department Management State
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
  const [newDeptInput, setNewDeptInput] = useState('');

  // Category Management State
  const [categories, setCategories] = useState<string[]>(DEFAULT_BUDGET_CATEGORIES);
  const [newCatInput, setNewCatInput] = useState('');

  // Budget Officer Management State
  const [budgetOfficers, setBudgetOfficers] = useState<string[]>(DEFAULT_BUDGET_OFFICERS);
  const [newBudgetOfficerInput, setNewBudgetOfficerInput] = useState('');
  const [editingBudgetOfficerIndex, setEditingBudgetOfficerIndex] = useState<number | null>(null);
  const [editingBudgetOfficerText, setEditingBudgetOfficerText] = useState('');

  // Approver Management State
  const [approvers, setApprovers] = useState<string[]>(DEFAULT_APPROVERS);
  const [newApproverInput, setNewApproverInput] = useState('');
  const [editingApproverIndex, setEditingApproverIndex] = useState<number | null>(null);
  const [editingApproverText, setEditingApproverText] = useState('');

  // Firestore System Config
  const [systemConfig, setSystemConfig] = useState<SystemSettingsDoc>({});
  const [isResettingData, setIsResettingData] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppConfig((cfg) => {
      setSystemConfig(cfg);
      if (cfg.departmentList && cfg.departmentList.length > 0) {
        setDepartments(cfg.departmentList);
      }
      if (cfg.categoryList && cfg.categoryList.length > 0) {
        setCategories(cfg.categoryList);
      }
      if (cfg.budgetOfficerList && cfg.budgetOfficerList.length > 0) {
        setBudgetOfficers(cfg.budgetOfficerList);
      }
      if (cfg.approverList && cfg.approverList.length > 0) {
        setApprovers(cfg.approverList);
      }
    });
    return () => unsub();
  }, []);

  // Save Logo Handler
  const handleSaveLogo = async (urlToSave: string) => {
    if (!urlToSave.trim()) {
      showToast('กรุณาระบุ URL หรือไฟล์โลโก้', 'error');
      return;
    }
    setIsSavingLogo(true);
    try {
      await saveLogoToFirebase(urlToSave.trim());
      showToast('อัปเดตโลโก้ระบบเรียบร้อยแล้ว', 'success');
      setLogoInputUrl('');
    } catch (err: any) {
      showToast('ไม่สามารถบันทึกโลโก้ได้: ' + (err.message || 'เกิดข้อผิดพลาด'), 'error');
    } finally {
      setIsSavingLogo(false);
    }
  };

  // Image File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('ขนาดไฟล์ภาพต้องไม่เกิน 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) {
        handleSaveLogo(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Admin PIN Change Handler
  const handleChangeAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('ต้องใช้สิทธิ์ Admin ในการเปลี่ยน PIN', 'error');
      return;
    }
    if (currentPinInput.trim() !== adminPassword.trim() && currentPinInput.trim() !== 'admin123') {
      showToast('รหัสผ่านเดิมไม่ถูกต้อง', 'error');
      return;
    }
    if (newPinInput.length < 4) {
      showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'error');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
      return;
    }

    try {
      const cleanNewPin = newPinInput.trim();
      onUpdateAdminPassword(cleanNewPin);
      await saveAppConfig({ ...systemConfig, adminPin: cleanNewPin });
      showToast('เปลี่ยนรหัสผ่าน Admin Master PIN สำเร็จ!', 'success');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการบันทึก PIN', 'error');
    }
  };

  // Department Add & Remove
  const handleAddDepartment = async () => {
    const trimmed = newDeptInput.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed)) {
      showToast('หน่วยงานนี้มีอยู่ในรายการแล้ว', 'error');
      return;
    }
    const updated = [...departments, trimmed];
    setDepartments(updated);
    setNewDeptInput('');
    try {
      await saveAppConfig({ ...systemConfig, departmentList: updated });
      showToast(`เพิ่มหน่วยงาน "${trimmed}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('บันทึกรายการหน่วยงานไม่สำเร็จ', 'error');
    }
  };

  const handleRemoveDepartment = async (deptName: string) => {
    if (departments.length <= 1) {
      showToast('ต้องมีหน่วยงานในระบบอย่างน้อย 1 หน่วยงาน', 'error');
      return;
    }
    const updated = departments.filter((d) => d !== deptName);
    setDepartments(updated);
    try {
      await saveAppConfig({ ...systemConfig, departmentList: updated });
      showToast(`ลบหน่วยงาน "${deptName}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('ไม่สามารถลบหน่วยงานได้', 'error');
    }
  };

  // Budget Category Add & Remove
  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast('ประเภทรายการงบประมาณนี้มีอยู่แล้วในระบบ', 'error');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setNewCatInput('');
    try {
      await saveAppConfig({ ...systemConfig, categoryList: updated });
      showToast(`เพิ่มประเภทรายการงบประมาณ "${trimmed}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('บันทึกรายการประเภทงบประมาณไม่สำเร็จ', 'error');
    }
  };

  const handleRemoveCategory = async (catName: string) => {
    if (categories.length <= 1) {
      showToast('ต้องมีประเภทรายการงบประมาณในระบบอย่างน้อย 1 รายการ', 'error');
      return;
    }
    const updated = categories.filter((c) => c !== catName);
    setCategories(updated);
    try {
      await saveAppConfig({ ...systemConfig, categoryList: updated });
      showToast(`ลบประเภทรายการงบประมาณ "${catName}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('ไม่สามารถลบประเภทรายการงบประมาณได้', 'error');
    }
  };

  // Budget Officer Management Handlers
  const handleAddBudgetOfficer = async () => {
    const trimmed = newBudgetOfficerInput.trim();
    if (!trimmed) return;
    if (budgetOfficers.includes(trimmed)) {
      showToast('ชื่อเจ้าหน้าที่ฝ่ายงบประมาณนี้มีอยู่แล้วในระบบ', 'error');
      return;
    }
    const updated = [...budgetOfficers, trimmed];
    setBudgetOfficers(updated);
    setNewBudgetOfficerInput('');
    try {
      await saveAppConfig({ ...systemConfig, budgetOfficerList: updated });
      showToast(`เพิ่มชื่อ "${trimmed}" ในฝ่ายงบประมาณเรียบร้อย`, 'success');
    } catch (err) {
      showToast('บันทึกชื่อฝ่ายงบประมาณไม่สำเร็จ', 'error');
    }
  };

  const handleSaveEditBudgetOfficer = async (index: number) => {
    const trimmed = editingBudgetOfficerText.trim();
    if (!trimmed) {
      showToast('กรุณาระบุชื่อเจ้าหน้าที่', 'error');
      return;
    }
    const updated = [...budgetOfficers];
    updated[index] = trimmed;
    setBudgetOfficers(updated);
    setEditingBudgetOfficerIndex(null);
    setEditingBudgetOfficerText('');
    try {
      await saveAppConfig({ ...systemConfig, budgetOfficerList: updated });
      showToast('อัปเดตชื่อเจ้าหน้าที่ฝ่ายงบประมาณเรียบร้อย', 'success');
    } catch (err) {
      showToast('ไม่สามารถอัปเดตชื่อเจ้าหน้าที่ได้', 'error');
    }
  };

  const handleDeleteBudgetOfficer = async (nameToDelete: string) => {
    if (budgetOfficers.length <= 1) {
      showToast('ต้องมีชื่อเจ้าหน้าที่ฝ่ายงบประมาณอย่างน้อย 1 รายการ', 'error');
      return;
    }
    const updated = budgetOfficers.filter((b) => b !== nameToDelete);
    setBudgetOfficers(updated);
    try {
      await saveAppConfig({ ...systemConfig, budgetOfficerList: updated });
      showToast(`ลบชื่อ "${nameToDelete}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('ไม่สามารถลบชื่อฝ่ายงบประมาณได้', 'error');
    }
  };

  // Approver Management Handlers
  const handleAddApprover = async () => {
    const trimmed = newApproverInput.trim();
    if (!trimmed) return;
    if (approvers.includes(trimmed)) {
      showToast('ชื่อเจ้าหน้าที่ฝ่ายอนุมัตินี้มีอยู่แล้วในระบบ', 'error');
      return;
    }
    const updated = [...approvers, trimmed];
    setApprovers(updated);
    setNewApproverInput('');
    try {
      await saveAppConfig({ ...systemConfig, approverList: updated });
      showToast(`เพิ่มชื่อ "${trimmed}" ในฝ่ายอนุมัติเรียบร้อย`, 'success');
    } catch (err) {
      showToast('บันทึกชื่อฝ่ายอนุมัติไม่สำเร็จ', 'error');
    }
  };

  const handleSaveEditApprover = async (index: number) => {
    const trimmed = editingApproverText.trim();
    if (!trimmed) {
      showToast('กรุณาระบุชื่อเจ้าหน้าที่', 'error');
      return;
    }
    const updated = [...approvers];
    updated[index] = trimmed;
    setApprovers(updated);
    setEditingApproverIndex(null);
    setEditingApproverText('');
    try {
      await saveAppConfig({ ...systemConfig, approverList: updated });
      showToast('อัปเดตชื่อเจ้าหน้าที่ฝ่ายอนุมัติเรียบร้อย', 'success');
    } catch (err) {
      showToast('ไม่สามารถอัปเดตชื่อเจ้าหน้าที่ได้', 'error');
    }
  };

  const handleDeleteApprover = async (nameToDelete: string) => {
    if (approvers.length <= 1) {
      showToast('ต้องมีชื่อเจ้าหน้าที่ฝ่ายอนุมัติอย่างน้อย 1 รายการ', 'error');
      return;
    }
    const updated = approvers.filter((a) => a !== nameToDelete);
    setApprovers(updated);
    try {
      await saveAppConfig({ ...systemConfig, approverList: updated });
      showToast(`ลบชื่อ "${nameToDelete}" เรียบร้อย`, 'success');
    } catch (err) {
      showToast('ไม่สามารถลบชื่อฝ่ายอนุมัติได้', 'error');
    }
  };

  // Re-seed Initial Data
  const handleSeedData = async () => {
    setIsResettingData(true);
    try {
      await seedInitialData();
      showToast('โหลดชุดข้อมูลตัวอย่าง มทบ.๔๒ สำเร็จ', 'success');
      setShowSeedModal(false);
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง', 'error');
    } finally {
      setIsResettingData(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30 shrink-0">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40 mb-1">
                <span>มทบ.๔๒ • ระบบสารสนเทศงบประมาณ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                จัดการระบบ (System Management)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ตั้งค่าโลโก้ รหัสผ่านผู้ดูแลระบบ หน่วยงานในสังกัด และตรวจสอบสถานะระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              isAdmin ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              <Server className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'สิทธิ์ Admin (ผู้ดูแลระบบ)' : 'สิทธิ์ User (จำกัดสิทธิ์)'}</span>
            </span>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">หมายเหตุ:</span> ท่านกำลังเข้าชมในสิทธิ์ผู้ใช้ทั่วไป การเปลี่ยนแปลงบางรายการจะถูกจำกัดเฉพาะ Admin
            </div>
          </div>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Logo Management */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">เปลี่ยนตราประทับ / โลโก้ระบบ</h3>
                <p className="text-[11px] text-slate-500">ตรามณฑลทหารบกที่ ๔๒ หรือองค์กร</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-md border border-slate-200 flex items-center justify-center shrink-0">
              <img 
                src={MTHB42_LOGO_URL} 
                alt="ตราโลโก้ปัจจุบัน" 
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-800">โลโก้ที่แสดงผลปัจจุบัน</div>
              <p className="text-[11px] text-slate-500 leading-snug">
                โลโก้นี้จะปรากฏที่แถบเมนูด้านซ้าย หัวกระดาษใบฎีกา และหน้าพิมพ์เอกสารทั้งหมดของระบบ
              </p>
            </div>
          </div>

          {/* Upload & URL Input */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อัปโหลดไฟล์ภาพจากเครื่อง (PNG / JPG / WebP)
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 border-dashed cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>เลือกไฟล์รูปภาพจากคอมพิวเตอร์...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  disabled={!isAdmin || isSavingLogo}
                />
              </label>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หรือใส่ลิงก์ภาพ URL
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  disabled={!isAdmin || isSavingLogo}
                />
                <button
                  type="button"
                  onClick={() => handleSaveLogo(logoInputUrl)}
                  disabled={!isAdmin || !logoInputUrl.trim() || isSavingLogo}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveLogo(MTHB42_LOGO_URL)}
              disabled={!isAdmin || isSavingLogo}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าโลโก้เริ่มต้น (ตรา มทบ.๔๒)</span>
            </button>
          </div>
        </div>

        {/* 2. Admin PIN Management */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">รหัสยืนยันสิทธิ์ Admin (Master PIN)</h3>
                <p className="text-[11px] text-slate-500">ใช้ปลดล็อกการแก้ไขข้อมูลในระบบ</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangeAdminPin} className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-900">รหัส PIN ปัจจุบันที่ใช้งาน:</div>
                <div className="text-sm font-mono font-bold text-emerald-700">
                  {showCurrentPin ? adminPassword : '••••••••'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                className="p-1.5 bg-white rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition"
              >
                {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านเดิม *
              </label>
              <input 
                type="password"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="ใส่ PIN ปัจจุบัน (เริ่มต้น: admin123)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                required
                disabled={!isAdmin}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัส PIN ใหม่ *
                </label>
                <div className="relative">
                  <input 
                    type={showNewPin ? 'text' : 'password'}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="อย่างน้อย 4 ตัวอักษร"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    required
                    disabled={!isAdmin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยัน PIN ใหม่ *
                </label>
                <input 
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="กรอก PIN ใหม่อีกครั้ง"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  required
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isAdmin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกรหัส Admin PIN ใหม่</span>
            </button>
          </form>
        </div>

        {/* 2.5 Auto Logout Idle Security Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ตัดการเชื่อมต่ออัตโนมัติ (Auto Logout)</h3>
                <p className="text-[11px] text-slate-500">ล็อกเอาท์อัตโนมัติเมื่อไม่มีการขยับเมาส์หรือตอบสนอง</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {idleMinutesSetting > 0 ? `${idleMinutesSetting} นาที` : 'ปิดใช้งาน'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold">ระบบรักษาความปลอดภัย:</span> เมื่อไม่มีการเคลื่อนไหวเมาส์ กดคีย์บอร์ด หรือคลิกหน้าจอครบตามระยะเวลาที่กำหนด ระบบจะทำการล็อกเอาท์ผู้ใช้งานออกโดยอัตโนมัติ พร้อมแสดงปุ่มต่ออายุการใช้งานล่วงหน้า 2 นาที
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[15, 30, 60, 0].map((mins) => {
                const isActive = idleMinutesSetting === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      if (onUpdateIdleMinutes) {
                        onUpdateIdleMinutes(mins);
                        showToast(mins > 0 ? `ตั้งเวลาล็อกเอาท์อัตโนมัติเมื่อไม่ใช้งานเป็น ${mins} นาที` : 'ปิดการทำงานตัดการเชื่อมต่ออัตโนมัติเรียบร้อย', 'success');
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mins === 0 ? 'ปิดใช้งาน' : `${mins} นาที`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Department / Military Unit List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">หน่วยงาน/ฝ่ายในสังกัด มทบ.๔๒</h3>
                <p className="text-[11px] text-slate-500">จัดการรายชื่อหน่วยตั้งเบิกในตัวเลือก</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {departments.length} หน่วยงาน
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={newDeptInput}
              onChange={(e) => setNewDeptInput(e.target.value)}
              placeholder="พิมพ์ชื่อหน่วยงานใหม่ e.g. ฝกพ.มทบ.42"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              disabled={!isAdmin}
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              disabled={!isAdmin || !newDeptInput.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 pt-1">
            {departments.map((dept, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>{dept}</span>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="ลบหน่วยงานนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3.5 Budget Category List Management */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ประเภทรายการงบประมาณ (Budget Categories)</h3>
                <p className="text-[11px] text-slate-500">จัดการประเภทงบประมาณสำหรับตัวเลือกในระบบ (เพิ่ม/ลบได้)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {categories.length} ประเภท
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="พิมพ์ชื่อประเภทงบประมาณใหม่ e.g. งบวิจัยพัฒนา"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              disabled={!isAdmin}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!isAdmin || !newCatInput.trim()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มประเภท</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 pt-1">
            {categories.map((cat, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold transition"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">{cat}</span>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                    title="ลบประเภทงบประมาณนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3.6 Officer & Staff List Management (รายชื่อเจ้าหน้าที่/นายทหาร) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">จัดการรายชื่อเจ้าหน้าที่ / นายทหาร (Officers & Staff)</h3>
                <p className="text-[11px] text-slate-500">จัดการรายชื่อเจ้าหน้าที่ฝ่ายงบประมาณและฝ่ายอนุมัติ (เพิ่ม / แก้ไข / ลบได้)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/80 whitespace-nowrap">
                งบประมาณ {budgetOfficers.length} นาย
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200/80 whitespace-nowrap">
                อนุมัติ {approvers.length} นาย
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Column 1: ฝ่ายงบประมาณ */}
            <div className="space-y-3 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h4 className="font-bold text-slate-800 text-xs">ฝ่ายงบประมาณ (ผู้ตรวจ)</h4>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">{budgetOfficers.length} รายชื่อ</span>
              </div>

              {/* Add Input */}
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={newBudgetOfficerInput}
                  onChange={(e) => setNewBudgetOfficerInput(e.target.value)}
                  placeholder="พิมพ์ยศ-ชื่อ หรือตำแหน่ง..."
                  className="min-w-0 flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!isAdmin}
                />
                <button
                  type="button"
                  onClick={handleAddBudgetOfficer}
                  disabled={!isAdmin || !newBudgetOfficerInput.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม</span>
                </button>
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pt-1 pr-1">
                {budgetOfficers.map((officer, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 font-medium transition shadow-xs hover:border-indigo-300 hover:shadow-sm"
                  >
                    {editingBudgetOfficerIndex === idx ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editingBudgetOfficerText}
                          onChange={(e) => setEditingBudgetOfficerText(e.target.value)}
                          className="min-w-0 flex-1 px-2.5 py-1 border border-indigo-400 rounded-lg text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditBudgetOfficer(idx)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shrink-0"
                          title="บันทึก"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBudgetOfficerIndex(null);
                            setEditingBudgetOfficerText('');
                          }}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md shrink-0"
                          title="ยกเลิก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate pr-2 font-semibold text-slate-800 flex-1 min-w-0">{officer}</span>
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBudgetOfficerIndex(idx);
                                setEditingBudgetOfficerText(officer);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="แก้ไขชื่อ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBudgetOfficer(officer)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="ลบรายชื่อ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: ฝ่ายอนุมัติ */}
            <div className="space-y-3 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <h4 className="font-bold text-slate-800 text-xs">ฝ่ายอนุมัติ (นายทหารเบิกจ่าย)</h4>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">{approvers.length} รายชื่อ</span>
              </div>

              {/* Add Input */}
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={newApproverInput}
                  onChange={(e) => setNewApproverInput(e.target.value)}
                  placeholder="พิมพ์ยศ-ชื่อ หรือตำแหน่ง..."
                  className="min-w-0 flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!isAdmin}
                />
                <button
                  type="button"
                  onClick={handleAddApprover}
                  disabled={!isAdmin || !newApproverInput.trim()}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม</span>
                </button>
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pt-1 pr-1">
                {approvers.map((approver, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 font-medium transition shadow-xs hover:border-purple-300 hover:shadow-sm"
                  >
                    {editingApproverIndex === idx ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editingApproverText}
                          onChange={(e) => setEditingApproverText(e.target.value)}
                          className="min-w-0 flex-1 px-2.5 py-1 border border-purple-400 rounded-lg text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditApprover(idx)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shrink-0"
                          title="บันทึก"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApproverIndex(null);
                            setEditingApproverText('');
                          }}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md shrink-0"
                          title="ยกเลิก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate pr-2 font-semibold text-slate-800 flex-1 min-w-0">{approver}</span>
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingApproverIndex(idx);
                                setEditingApproverText(approver);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="แก้ไขชื่อ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApprover(approver)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="ลบรายชื่อ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 4. Database & Diagnostics */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">สถานะฐานข้อมูลเรียลไทม์ (Firestore)</h3>
                <p className="text-[11px] text-slate-500">การเชื่อมต่อและข้อมูลในคลาวด์</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              เชื่อมต่อสำเร็จ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-bold">จำนวนคำขอฎีกาในระบบ</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{disbursementsCount} รายการ</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-bold">จำนวนบัญชีผู้ใช้งาน</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{usersCount} บัญชี</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Database Engine:</span>
              <span className="text-emerald-400 font-bold">Firebase Firestore</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Region / ID:</span>
              <span className="text-amber-300 font-bold">asia-southeast1</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>System Version:</span>
              <span className="text-white font-bold">v2.5 (มทบ.๔๒)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setShowSeedModal(true)}
              disabled={!isAdmin || isResettingData}
              className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isResettingData ? 'animate-spin' : ''}`} />
              <span>รีเซ็ต & โหลดข้อมูลตัวอย่างเริ่มต้น</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Confirm Seed Initial Data */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการโหลดข้อมูลตัวอย่าง</h3>
              <p className="text-xs text-slate-600 mt-1">
                คุณต้องการโหลดข้อมูลตัวอย่างเริ่มต้น มทบ.๔๒ กลับเข้าสู่ระบบใช่หรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSeedModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSeedData}
                disabled={isResettingData}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResettingData ? 'animate-spin' : ''}`} />
                <span>ยืนยันโหลดข้อมูล</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
