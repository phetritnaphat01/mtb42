import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Save, 
  Key, 
  Lock, 
  ChevronRight,
  Filter,
  UserX,
  Mail,
  Building,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole, FeatureFlags, DEFAULT_FEATURE_FLAGS } from '../types';
import { 
  subscribeAllUsers, 
  updateUserRoleAndInfo, 
  deleteUserDoc, 
  registerUserWithFirebase,
  adminUpdateUserPassword,
  subscribeAppConfig,
  saveAppConfig
} from '../firebase';

interface PermissionsManagementProps {
  isAdmin: boolean;
  currentUserProfile: UserProfile | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PermissionsManagement: React.FC<PermissionsManagementProps> = ({
  isAdmin,
  currentUserProfile,
  showToast
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRank, setEditRank] = useState('');
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('USER');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Reset Password Modal State
  const [resetPassUser, setResetPassUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [uid: string]: boolean }>({});

  const decodePassword = (passSecret?: string) => {
    if (!passSecret) return 'admin123';
    try {
      return atob(passSecret) || 'admin123';
    } catch {
      return passSecret || 'admin123';
    }
  };

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUsernameOrEmail, setAddUsernameOrEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [showAddPass, setShowAddPass] = useState(false);
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addRank, setAddRank] = useState('ร.อ.');
  const [addDepartment, setAddDepartment] = useState('บก.มทบ.42');
  const [addRole, setAddRole] = useState<UserRole>('USER');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Effective Admin Check
  const isEffectiveAdmin = isAdmin || currentUserProfile?.role === 'ADMIN';

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [isSavingFlags, setIsSavingFlags] = useState(false);
  const [showResetFlagsConfirm, setShowResetFlagsConfirm] = useState(false);
  const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<UserProfile | null>(null);

  // Subscribe to users list & feature flags from Firestore
  useEffect(() => {
    const unsubUsers = subscribeAllUsers((usersList) => {
      setUsers(usersList);
    });
    const unsubConfig = subscribeAppConfig((cfg) => {
      if (cfg.featureFlags) {
        setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...cfg.featureFlags });
      }
    });
    return () => {
      unsubUsers();
      unsubConfig();
    };
  }, []);

  const handleToggleFlag = async (key: keyof FeatureFlags) => {
    if (!isEffectiveAdmin) {
      showToast('เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถปรับเปลี่ยนสิทธิ์ฟังก์ชั่นได้', 'error');
      return;
    }
    const updated = {
      ...featureFlags,
      [key]: !featureFlags[key]
    };
    setFeatureFlags(updated);
    try {
      setIsSavingFlags(true);
      await saveAppConfig({ featureFlags: updated });
      showToast(`อัปเดตการตั้งค่าเปิด/ปิดฟังก์ชั่นเรียบร้อยแล้ว`, 'success');
    } catch (err) {
      console.error('Failed to update feature flags:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่าสิทธิ์', 'error');
    } finally {
      setIsSavingFlags(false);
    }
  };

  const handleConfirmResetFlags = async () => {
    if (!isEffectiveAdmin) return;
    try {
      setIsSavingFlags(true);
      setFeatureFlags(DEFAULT_FEATURE_FLAGS);
      await saveAppConfig({ featureFlags: DEFAULT_FEATURE_FLAGS });
      showToast('คืนค่าสิทธิ์ฟังก์ชั่นเริ่มต้นเรียบร้อยแล้ว', 'success');
      setShowResetFlagsConfirm(false);
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการคืนค่าเริ่มต้น', 'error');
    } finally {
      setIsSavingFlags(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = 
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.rank && u.rank.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Role Toggle
  const handleToggleRole = async (userToToggle: UserProfile) => {
    if (!isAdmin) {
      showToast('ต้องใช้สิทธิ์ Admin ในการเปลี่ยนบทบาทผู้ใช้', 'error');
      return;
    }
    const targetRole: UserRole = userToToggle.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateUserRoleAndInfo(userToToggle.uid, { role: targetRole });
      showToast(`เปลี่ยนสิทธิ์ของ "${userToToggle.displayName}" เป็น ${targetRole === 'ADMIN' ? 'ผู้ดูแลระบบ (ADMIN)' : 'ผู้ใช้ทั่วไป (USER)'} สำเร็จ`, 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการปรับเปลี่ยนสิทธิ์', 'error');
    }
  };

  // Open Edit User Modal
  const handleOpenEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditRank(u.rank || '');
    setEditName(u.displayName);
    setEditDept(u.department);
    setEditRole(u.role);
  };

  // Save Edit User
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!isAdmin) {
      showToast('เฉพาะ Admin เท่านั้นที่แก้ไขข้อมูลผู้ใช้อื่นได้', 'error');
      return;
    }

    setIsSavingUser(true);
    try {
      await updateUserRoleAndInfo(editingUser.uid, {
        displayName: editName.trim(),
        rank: editRank.trim(),
        department: editDept.trim(),
        role: editRole
      });
      showToast(`อัปเดตข้อมูลบัญชีของ "${editName}" เรียบร้อยแล้ว`, 'success');
      setEditingUser(null);
    } catch (err: any) {
      showToast('ไม่สามารถอัปเดตข้อมูลได้: ' + (err.message || ''), 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUserClick = (u: UserProfile) => {
    if (!isEffectiveAdmin) {
      showToast('เฉพาะ Admin เท่านั้นที่สามารถลบบัญชีผู้ใช้ได้', 'error');
      return;
    }
    if (u.uid === currentUserProfile?.uid) {
      showToast('ไม่สามารถลบบัญชีของตนเองในขณะใช้งานได้', 'error');
      return;
    }
    setUserToDeleteConfirm(u);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDeleteConfirm) return;
    try {
      await deleteUserDoc(userToDeleteConfirm.uid);
      showToast(`ลบบัญชีผู้ใช้ "${userToDeleteConfirm.displayName}" เรียบร้อยแล้ว`, 'success');
      setUserToDeleteConfirm(null);
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้', 'error');
    }
  };

  // Reset Password for User
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser) return;
    if (!newPasswordInput || newPasswordInput.length < 4) {
      showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'error');
      return;
    }
    setIsResettingPass(true);
    try {
      await adminUpdateUserPassword(resetPassUser.uid, newPasswordInput.trim());
      showToast(`เปลี่ยนรหัสผ่านสำหรับ "${resetPassUser.displayName}" สำเร็จแล้ว!`, 'success');
      setResetPassUser(null);
      setNewPasswordInput('');
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + (err.message || ''), 'error');
    } finally {
      setIsResettingPass(false);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsernameOrEmail || !addPassword || !addDisplayName) {
      showToast('กรุณากรอกข้อมูลสำคัญ (ชื่อผู้ใช้/อีเมล, รหัสผ่าน, ชื่อ-นามสกุล) ให้ครบถ้วน', 'error');
      return;
    }
    if (addPassword.length < 4) {
      showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'error');
      return;
    }

    setIsAddingUser(true);
    try {
      await registerUserWithFirebase({
        email: addUsernameOrEmail,
        password: addPassword,
        displayName: `${addRank ? addRank + ' ' : ''}${addDisplayName}`.trim(),
        department: addDepartment,
        rank: addRank,
        role: addRole
      });
      showToast(`สร้างและลงทะเบียนบัญชีสมาชิกใหม่ "${addDisplayName}" (${addRole}) สำเร็จแล้ว!`, 'success');
      setIsAddUserModalOpen(false);
      setAddUsernameOrEmail('');
      setAddPassword('');
      setAddDisplayName('');
    } catch (err: any) {
      showToast('สร้างบัญชีไม่สำเร็จ: ' + (err.message || ''), 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40 mb-1">
                <span>ระบบสิทธิ์ & การกำหนดบทบาทผู้ใช้งาน</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                จัดการสิทธิ์ (Permission & Access Control)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                อนุมัติสิทธิ์ กำหนดบทบาทผู้ดูแลระบบ (ADMIN) และตรวจสอบผู้ใช้งานทั้งหมดในสังกัด
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isAdmin && (
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>เพิ่มผู้ใช้งานใหม่</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Role Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-500 font-bold">ผู้ใช้งานทั้งหมดในระบบ</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length} บัญชี</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-emerald-700 font-bold">ผู้ดูแลระบบ (ADMIN)</div>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">
              {users.filter(u => u.role === 'ADMIN').length} คน
            </div>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-amber-700 font-bold">ผู้ใช้ทั่วไป (USER)</div>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">
              {users.filter(u => u.role === 'USER').length} คน
            </div>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* User Search & Role Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่อ, ยศ, อีเมล, หรือหน่วยงาน..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>กรองบทบาท:</span>
          </span>
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'ADMIN' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            ADMIN ({users.filter(u => u.role === 'ADMIN').length})
          </button>
          <button
            onClick={() => setRoleFilter('USER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'USER' ? 'bg-amber-500 text-slate-950' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            USER ({users.filter(u => u.role === 'USER').length})
          </button>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>ตารางรายชื่อผู้ใช้งานในระบบ ({filteredUsers.length} บัญชี)</span>
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 pl-5">ชื่อ-นามสกุล / ยศ</th>
                  <th className="p-3.5">อีเมลบัญชี</th>
                  <th className="p-3.5">หน่วยงาน/สังกัด</th>
                  <th className="p-3.5">บทบาทสิทธิ์ (Role)</th>
                  <th className="p-3.5">รหัสผ่าน (Password)</th>
                  <th className="p-3.5">เข้าสู่ระบบล่าสุด</th>
                  <th className="p-3.5 text-right pr-5">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = u.uid === currentUserProfile?.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">
                        <div 
                          onClick={() => handleOpenEditModal(u)}
                          className="flex items-center gap-2.5 cursor-pointer group"
                          title="คลิกเพื่อแก้ไขข้อมูลชื่อ ยศ สังกัด และสิทธิ์"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition group-hover:scale-105 ${
                            u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {u.displayName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="group-hover:text-indigo-600 transition underline-offset-2 group-hover:underline">{u.displayName}</span>
                              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                              {isSelf && (
                                <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  (บัญชีคุณ)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 font-mono">
                        {u.email}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{u.department || 'บก.มทบ.42'}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={!isAdmin || isSelf}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 border ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-500/15 text-emerald-800 border-emerald-400/40 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-900 border-amber-400/40 hover:bg-amber-500/25'
                          }`}
                          title="คลิกเพื่อสลับสิทธิ์สลับไปมา"
                        >
                          {u.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{u.role === 'ADMIN' ? 'ผู้ดูแลระบบ (ADMIN)' : 'ผู้ใช้ทั่วไป (USER)'}</span>
                        </button>
                      </td>

                      <td className="p-3.5 font-mono text-xs">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                          <span className="font-bold text-amber-800">
                            {visiblePasswords[u.uid] ? decodePassword(u.passSecret) : '••••••••'}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.uid]: !prev[u.uid] }))}
                              className="text-slate-400 hover:text-slate-700 transition"
                              title={visiblePasswords[u.uid] ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {visiblePasswords[u.uid] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('th-TH') : 'ยังไม่ได้บันทึก'}
                      </td>

                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end space-x-1">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setResetPassUser(u);
                                setNewPasswordInput(decodePassword(u.passSecret));
                                setShowResetPass(true);
                              }}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                              title="ดูและเปลี่ยนรหัสผ่านผู้ใช้"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="แก้ไขข้อมูลผู้ใช้"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {isEffectiveAdmin && !isSelf && (
                            <button
                              onClick={() => handleDeleteUserClick(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="ลบบัญชีนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission Comparison Matrix Table with Interactive Feature Toggles for Admin */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>ตารางตั้งค่าเปิด-ปิดฟังก์ชั่นระบบ (Feature Control Matrix)</span>
                {isEffectiveAdmin && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Admin สามารถคลิกเปลี่ยนสิทธิ์ได้ทันที
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">กำหนดสิทธิ์เปิด/ปิดการใช้งานฟังก์ชั่นต่างๆ สำหรับผู้ใช้งานทั่วไป (USER) และผู้ดูแลระบบ (ADMIN)</p>
            </div>
          </div>

          {isEffectiveAdmin && (
            <button
              type="button"
              onClick={() => setShowResetFlagsConfirm(true)}
              disabled={isSavingFlags}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-amber-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSavingFlags ? 'animate-spin' : ''}`} />
              <span>คืนค่าสิทธิ์เริ่มต้น</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 rounded-tl-xl">ฟังก์ชั่น / การกระทำในระบบ</th>
                <th className="p-3.5 text-center w-48 bg-amber-500 text-slate-950 font-bold">
                  ผู้ใช้งานทั่วไป (USER)
                </th>
                <th className="p-3.5 text-center w-48 bg-emerald-600 text-white font-bold rounded-tr-xl">
                  ผู้ดูแลระบบ (ADMIN)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200 bg-white">
              {[
                { id: 1, label: '1. เข้าดูแดชบอร์ด รายการฎีกา และกราฟสรุปงบประมาณ', userKey: 'viewDashboardUser' as const, adminKey: 'viewDashboardAdmin' as const },
                { id: 2, label: '2. ยื่นคำขอตั้งเบิกงบประมาณใหม่', userKey: 'createDisbursementUser' as const, adminKey: 'createDisbursementAdmin' as const },
                { id: 3, label: '3. แก้ไขข้อมูลและเปลี่ยนสถานะฎีกาเบิกจ่าย', userKey: 'editDisbursementUser' as const, adminKey: 'editDisbursementAdmin' as const },
                { id: 4, label: '4. ลบรายการฎีกาออกจากระบบ', userKey: 'deleteDisbursementUser' as const, adminKey: 'deleteDisbursementAdmin' as const },
                { id: 5, label: '5. พิมพ์เอกสารใบฎีกาเบิกเงิน (Voucher Print)', userKey: 'printVoucherUser' as const, adminKey: 'printVoucherAdmin' as const },
                { id: 6, label: '6. ส่งออกไฟล์ Excel / PDF / Google Sheets', userKey: 'exportDataUser' as const, adminKey: 'exportDataAdmin' as const },
                { id: 7, label: '7. เปลี่ยนตราประทับ/โลโก้ระบบ & ตั้งค่า Admin Master PIN', userKey: 'systemSettingsUser' as const, adminKey: 'systemSettingsAdmin' as const },
                { id: 8, label: '8. ปรับเปลี่ยนบทบาทผู้ใช้ (Role) และจัดการสิทธิ์', userKey: 'roleManagementUser' as const, adminKey: 'roleManagementAdmin' as const },
              ].map((row) => {
                const userVal = featureFlags[row.userKey];
                const adminVal = featureFlags[row.adminKey];

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-semibold text-slate-800 text-xs">
                      {row.label}
                    </td>

                    {/* USER Role Toggle Cell */}
                    <td className="p-3 text-center">
                      {isEffectiveAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(row.userKey)}
                          disabled={isSavingFlags}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                            userVal
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-200'
                              : 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-200'
                          }`}
                          title={`คลิกเพื่อ ${userVal ? 'ปิด' : 'เปิด'} ฟังก์ชั่นนี้สำหรับ USER`}
                        >
                          {userVal ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>เปิดใช้งาน</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 stroke-[3]" />
                              <span>ปิดใช้งาน</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1 font-bold ${userVal ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {userVal ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto" />}
                        </span>
                      )}
                    </td>

                    {/* ADMIN Role Toggle Cell */}
                    <td className="p-3 text-center">
                      {isEffectiveAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(row.adminKey)}
                          disabled={isSavingFlags}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                            adminVal
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-200'
                              : 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-200'
                          }`}
                          title={`คลิกเพื่อ ${adminVal ? 'ปิด' : 'เปิด'} ฟังก์ชั่นนี้สำหรับ ADMIN`}
                        >
                          {adminVal ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>เปิดใช้งาน</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 stroke-[3]" />
                              <span>ปิดใช้งาน</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1 font-bold ${adminVal ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {adminVal ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto" />}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>แก้ไขข้อมูลผู้ใช้งาน</span>
              </h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ยศ</label>
                  <input 
                    type="text"
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value)}
                    placeholder="e.g. พ.อ."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยงาน/สังกัด *</label>
                <input 
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดบทบาทสิทธิ์ (Role) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('USER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      editRole === 'USER' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>USER (ผู้ใช้ทั่วไป)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('ADMIN')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      editRole === 'ADMIN' ? 'bg-slate-900 text-emerald-400 border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ADMIN (ผู้ดูแล)</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingUser ? 'กำลังบันทึก...' : 'บันทึกแก้ไข'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span>เปลี่ยนรหัสผ่านผู้ใช้งาน</span>
              </h3>
              <button 
                onClick={() => setResetPassUser(null)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">รหัสผ่านของบัญชีผู้ใช้:</p>
                  <p className="text-amber-800 font-semibold mt-0.5">{resetPassUser.displayName} ({resetPassUser.email})</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-amber-700 font-bold block">รหัสผ่านปัจจุบัน:</span>
                <code className="bg-amber-100/80 px-2 py-0.5 rounded font-mono font-bold text-amber-900 text-xs">
                  {decodePassword(resetPassUser.passSecret)}
                </code>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านใหม่ *</label>
                <div className="relative">
                  <input 
                    type={showResetPass ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isResettingPass}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isResettingPass ? 'กำลังบันทึก...' : 'อัปเดตรหัสผ่านใหม่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>เพิ่มและสมัครสมาชิกผู้ใช้งานใหม่</span>
              </h3>
              <button 
                onClick={() => setIsAddUserModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้ (Username) หรือ อีเมล *
                </label>
                <input 
                  type="text"
                  value={addUsernameOrEmail}
                  onChange={(e) => setAddUsernameOrEmail(e.target.value)}
                  placeholder="เช่น officer1, somchai หรือ user@mthb42.go.th"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * สามารถระบุเป็นชื่อภาษาอังกฤษ/ตัวเลข (เช่น officer1) หรืออีเมลได้
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านบัญชี *</label>
                <div className="relative">
                  <input 
                    type={showAddPass ? 'text' : 'password'}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน (อย่างน้อย 4 ตัวอักษร)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAddPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ยศ</label>
                  <input 
                    type="text"
                    value={addRank}
                    onChange={(e) => setAddRank(e.target.value)}
                    placeholder="ร.อ."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input 
                    type="text"
                    value={addDisplayName}
                    onChange={(e) => setAddDisplayName(e.target.value)}
                    placeholder="ชื่อ นามสกุล"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยงานสังกัด *</label>
                <input 
                  type="text"
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  placeholder="บก.มทบ.42"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole('USER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      addRole === 'USER' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>USER (ผู้ใช้ทั่วไป)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddRole('ADMIN')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      addRole === 'ADMIN' ? 'bg-slate-900 text-emerald-400 border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ADMIN (ผู้ดูแล)</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingUser ? 'กำลังสร้าง...' : 'สร้างและสมัครสมาชิก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reset Feature Flags */}
      {showResetFlagsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการคืนค่าสิทธิ์เริ่มต้น</h3>
              <p className="text-xs text-slate-600 mt-1">
                คุณต้องการคืนค่าการเปิด/ปิดสิทธิ์ฟังก์ชั่นทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetFlagsConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmResetFlags}
                disabled={isSavingFlags}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSavingFlags ? 'animate-spin' : ''}`} />
                <span>ยืนยันคืนค่าสิทธิ์</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete User */}
      {userToDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบบัญชีผู้ใช้</h3>
              <p className="text-xs text-slate-600 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี <span className="font-bold text-slate-900">"{userToDeleteConfirm.displayName}"</span> ({userToDeleteConfirm.email}) ออกจากระบบ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
              >
                ยืนยันลบบัญชี
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
