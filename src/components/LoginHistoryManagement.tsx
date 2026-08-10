import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  MapPin, 
  Laptop, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  User, 
  Building2, 
  ExternalLink,
  Info,
  AlertTriangle,
  X,
  Sparkles,
  Monitor
} from 'lucide-react';
import { LoginHistoryRecord } from '../types';
import { subscribeLoginHistory, deleteLoginHistoryDoc, clearAllLoginHistoryDocs } from '../firebase';

interface LoginHistoryManagementProps {
  isAdmin?: boolean;
  departments?: string[];
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export const LoginHistoryManagement: React.FC<LoginHistoryManagementProps> = ({
  isAdmin = false,
  departments = [],
  showToast
}) => {
  const [logs, setLogs] = useState<LoginHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL'); // ALL, TODAY, 7DAYS, 30DAYS
  const [selectedDetailLog, setSelectedDetailLog] = useState<LoginHistoryRecord | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeLoginHistory((records) => {
      setLogs(records);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    if (showToast) showToast(`คัดลอก IP Address ${ip} เรียบร้อยแล้ว`, 'success');
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleDeleteSingleDoc = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      if (showToast) showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบประวัติได้', 'error');
      return;
    }
    if (window.confirm(`คุณต้องการลบประวัติการเข้าใช้งานของ "${name}" รายการนี้ใช่หรือไม่?`)) {
      try {
        await deleteLoginHistoryDoc(id);
        if (showToast) showToast('ลบรายการประวัติการเข้าใช้งานเรียบร้อยแล้ว', 'success');
      } catch (err) {
        if (showToast) showToast('ไม่สามารถลบรายการได้', 'error');
      }
    }
  };

  const handleClearAllLogs = async () => {
    if (!isAdmin) {
      if (showToast) showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถล้างประวัติทั้งหมดได้', 'error');
      return;
    }
    try {
      await clearAllLoginHistoryDocs();
      setShowClearConfirmModal(false);
      if (showToast) showToast('ล้างประวัติการเข้าสู่ระบบทั้งหมดเรียบร้อยแล้ว', 'success');
    } catch (err) {
      if (showToast) showToast('เกิดข้อผิดพลาดในการล้างประวัติ', 'error');
    }
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      if (showToast) showToast('ไม่มีข้อมูลสำหรับส่งออก', 'error');
      return;
    }

    const headers = ['วัน-เวลา', 'ยศ/ชื่อ-นามสกุล', 'อีเมล', 'สังกัด', 'สิทธิ์', 'IP Address', 'สถานที่ (GeoIP)', 'อุปกรณ์ & เบราว์เซอร์'];
    const rows = filteredLogs.map(l => [
      formatThaiDateTime(l.timestamp),
      `"${l.rank ? l.rank + ' ' : ''}${l.displayName}"`,
      `"${l.email}"`,
      `"${l.department}"`,
      l.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป',
      l.ip,
      `"${l.locationName}"`,
      `"${l.deviceInfo}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `login_history_mthb42_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('ส่งออกข้อมูลประวัติการเข้าใช้งานเป็น CSV เรียบร้อยแล้ว', 'success');
  };

  // Filter Logic
  const filteredLogs = useMemo(() => {
    const now = new Date();
    return logs.filter(item => {
      // Search term
      const matchSearch = 
        !searchTerm.trim() ||
        item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.rank && item.rank.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchDept = selectedDepartment === 'ALL' || item.department === selectedDepartment;

      // Role filter
      const matchRole = selectedRole === 'ALL' || item.role === selectedRole;

      // Date filter
      let matchDate = true;
      if (dateFilter !== 'ALL') {
        const itemDate = new Date(item.timestamp);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (dateFilter === 'TODAY') {
          matchDate = itemDate.toDateString() === now.toDateString();
        } else if (dateFilter === '7DAYS') {
          matchDate = diffDays <= 7;
        } else if (dateFilter === '30DAYS') {
          matchDate = diffDays <= 30;
        }
      }

      return matchSearch && matchDept && matchRole && matchDate;
    });
  }, [logs, searchTerm, selectedDepartment, selectedRole, dateFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalLogins = logs.length;
    const uniqueUsers = new Set(logs.map(l => l.uid || l.email)).size;
    const uniqueIps = new Set(logs.map(l => l.ip)).size;

    // Devices breakdown
    const devicesCount: Record<string, number> = {};
    logs.forEach(l => {
      const dev = l.deviceInfo || 'ทั่วไป';
      devicesCount[dev] = (devicesCount[dev] || 0) + 1;
    });
    let topDevice = 'ไม่ระบุ';
    let topCount = 0;
    Object.entries(devicesCount).forEach(([dev, cnt]) => {
      if (cnt > topCount) {
        topCount = cnt;
        topDevice = dev;
      }
    });

    return { totalLogins, uniqueUsers, uniqueIps, topDevice };
  }, [logs]);

  function formatThaiDateTime(isoStr: string) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const thaiYear = d.getFullYear() + 543;
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const day = d.getDate();
      const month = monthNames[d.getMonth()];
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return `${day} ${month} ${thaiYear} - ${hours}:${mins}:${secs} น.`;
    } catch (e) {
      return isoStr;
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-semibold">
              <History className="w-3.5 h-3.5" />
              <span>การติดตามและบันทึกประวัติความปลอดภัย</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>ประวัติการเข้าสู่ระบบ</span>
              <span className="text-xs font-normal text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                Login History Log
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ติดตามบันทึกเวลาการเข้าถึงระบบของผู้ใช้งาน หมายเลข IP Address ตำแหน่งพิกัดทางภูมิศาสตร์ (GeoIP) และข้อมูลอุปกรณ์/เบราว์เซอร์ เพื่อความปลอดภัยของระบบ มทบ.๔๒
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>ส่งออก CSV</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="px-3.5 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>ล้างประวัติทั้งหมด</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Logins */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">การเข้าสู่ระบบทั้งหมด</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalLogins.toLocaleString()} <span className="text-xs font-normal text-slate-500">ครั้ง</span></h3>
            <p className="text-[11px] text-slate-400 mt-1">บันทึกประวัติการเชื่อมต่อ</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <History className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Unique Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ผู้ใช้งานที่ไม่ซ้ำ</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.uniqueUsers} <span className="text-xs font-normal text-slate-500">บัญชี</span></h3>
            <p className="text-[11px] text-slate-400 mt-1">ผู้เข้าใช้งานระบบล่าสุด</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Unique IPs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address ต่างๆ</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.uniqueIps} <span className="text-xs font-normal text-slate-500">ไอพี</span></h3>
            <p className="text-[11px] text-slate-400 mt-1">ไอพีเครือข่ายที่บันทึก</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Top Device */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">อุปกรณ์ใช้งานหลัก</p>
            <h3 className="text-sm font-bold text-slate-800 mt-1 truncate max-w-[170px]" title={stats.topDevice}>{stats.topDevice}</h3>
            <p className="text-[11px] text-slate-400 mt-1">เบราว์เซอร์ที่ใช้บ่อยที่สุด</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, ยศ, สังกัด, IP Address, สถานที่..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">สังกัด: ทั้งหมด</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-40 shrink-0">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">สิทธิ์: ทั้งหมด</option>
              <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
              <option value="USER">ผู้ใช้ทั่วไป (User)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-36 shrink-0">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">ช่วงเวลา: ทั้งหมด</option>
              <option value="TODAY">วันนี้</option>
              <option value="7DAYS">7 วันล่าสุด</option>
              <option value="30DAYS">30 วันล่าสุด</option>
            </select>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <div>
            แสดงผล <span className="font-bold text-slate-800">{filteredLogs.length}</span> จากทั้งหมด <span className="font-bold text-slate-800">{logs.length}</span> รายการ
          </div>
          {(searchTerm || selectedDepartment !== 'ALL' || selectedRole !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('ALL');
                setSelectedRole('ALL');
                setDateFilter('ALL');
              }}
              className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-semibold">กำลังโหลดข้อมูลประวัติการเข้าใช้งาน...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Info className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">ไม่พบประวัติการเข้าสู่ระบบตามเงื่อนไขที่ระบุ</p>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหาหรือเลือกสิทธิ์/สังกัดเป็นทั้งหมด</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">วัน-เวลาเข้าใช้งาน</th>
                  <th className="p-4">ผู้ใช้งาน / ยศ-ชื่อ</th>
                  <th className="p-4">สังกัดหน่วยงาน</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">สถานที่ (GeoIP Location)</th>
                  <th className="p-4">เบราว์เซอร์ / อุปกรณ์</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 pr-6 text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((item) => {
                  const isDeviceMobile = item.deviceInfo.includes('Mobile') || item.deviceInfo.includes('iPhone') || item.deviceInfo.includes('Android');
                  
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedDetailLog(item)}
                      className="hover:bg-amber-50/40 transition cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="p-4 pl-6 font-semibold text-slate-700 shrink-0">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatThaiDateTime(item.timestamp)}</span>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            item.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.displayName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-amber-600 transition flex items-center gap-1.5">
                              <span>{item.rank ? item.rank + ' ' : ''}{item.displayName}</span>
                              {item.role === 'ADMIN' && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                  ผู้ดูแลระบบ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{item.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{item.department || 'บก.มทบ.42'}</span>
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition font-mono text-[11px] font-bold text-slate-800">
                          <span>{item.ip}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyIp(item.ip, e)}
                            className="text-slate-400 hover:text-amber-600 transition cursor-pointer p-0.5"
                            title="คัดลอก IP Address"
                          >
                            {copiedIp === item.ip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* GeoIP Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 max-w-[220px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate font-medium" title={item.locationName}>{item.locationName}</span>
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 max-w-[200px]">
                          {isDeviceMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="truncate font-medium text-[11px]" title={item.deviceInfo}>
                            {item.deviceInfo}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>สำเร็จ</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailLog(item);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition text-[11px] cursor-pointer"
                          >
                            ดูรายละเอียด
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSingleDoc(item.id, item.displayName, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Detail Modal: Complete Log & User-Agent Inspector */}
      {selectedDetailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-bold shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">รายละเอียดประวัติการเข้าสู่ระบบ</h3>
                  <p className="text-xs text-slate-500">ID: {selectedDetailLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-4 text-xs overflow-y-auto my-3 pr-1 flex-1">
              {/* User Profile Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ข้อมูลผู้เข้าใช้งาน</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ยศ - ชื่อ-นามสกุล:</span>
                  <span className="font-bold text-slate-900">{selectedDetailLog.rank ? selectedDetailLog.rank + ' ' : ''}{selectedDetailLog.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">สังกัดหน่วยงาน:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">อีเมล/บัญชี:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ระดับสิทธิ์:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedDetailLog.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {selectedDetailLog.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (User)'}
                  </span>
                </div>
              </div>

              {/* IP & Location */}
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>IP Address & ตำแหน่งทางภูมิศาสตร์ (GeoIP)</span>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">หมายเลข IP Address:</span>
                  <span className="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {selectedDetailLog.ip}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">เมือง/อำเภอ:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.city || 'หาดใหญ่'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">จังหวัด/ภูมิภาค:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.region || 'สงขลา'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ประเทศ:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.country || 'ประเทศไทย'}</span>
                </div>
                <div className="flex items-start justify-between pt-1 border-t border-indigo-100/60">
                  <span className="text-slate-500">สถานที่ระบุเต็ม:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[250px]">{selectedDetailLog.locationName}</span>
                </div>
              </div>

              {/* Device & User Agent Raw String */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-2 font-mono text-[11px]">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-sans flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>ข้อมูลอุปกรณ์ & User-Agent String</span>
                </p>
                <div>
                  <span className="text-slate-400 font-sans">สรุปอุปกรณ์: </span>
                  <span className="text-white font-bold font-sans">{selectedDetailLog.deviceInfo}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 mb-1 font-sans">Raw User-Agent Header:</p>
                  <p className="p-2.5 bg-slate-950 rounded-xl text-slate-300 break-all leading-relaxed text-[10px]">
                    {selectedDetailLog.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                <span>บันทึกเมื่อเวลา:</span>
                <span className="font-bold text-slate-800">{formatThaiDateTime(selectedDetailLog.timestamp)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Logs */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการล้างประวัติการเข้าสู่ระบบทั้งหมด</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                คุณแน่ใจหรือว่าต้องการล้างบันทึกประวัติการเข้าใช้งานทั้งหมดออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleClearAllLogs}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
              >
                ยืนยันล้างประวัติทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
