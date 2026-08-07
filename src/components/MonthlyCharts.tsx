import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { MonthlySummary, CategorySummary, DepartmentSummary } from '../types';
import { BarChart3, PieChart as PieChartIcon, Building, Layers } from 'lucide-react';

interface MonthlyChartsProps {
  monthlyData: MonthlySummary[];
  categoryData: CategorySummary[];
  departmentData: DepartmentSummary[];
}

const COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#475569'  // Slate
];

export const MonthlyCharts: React.FC<MonthlyChartsProps> = ({
  monthlyData,
  categoryData,
  departmentData
}) => {
  const [chartView, setChartView] = useState<'monthly' | 'category' | 'department'>('monthly');

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `฿${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `฿${(val / 1000).toFixed(0)}K`;
    }
    return `฿${val}`;
  };

  const formatFullTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 my-6">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            กราฟสรุปการเบิกจ่ายงบประมาณแบบเรียลไทม์
          </h2>
          <p className="text-xs text-slate-500">
            วิเคราะห์เปรียบเทียบตามรายเดือน ประเภทงบประมาณ และหน่วยงานตั้งเบิก
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setChartView('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              chartView === 'monthly'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            สรุปรายเดือน
          </button>

          <button
            onClick={() => setChartView('category')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              chartView === 'category'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            แยกตามประเภทรายการ
          </button>

          <button
            onClick={() => setChartView('department')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              chartView === 'department'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            แยกตามหน่วยงาน
          </button>
        </div>
      </div>

      {/* CHART VIEW 1: MONTHLY SUMMARY */}
      {chartView === 'monthly' && (
        <div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="monthName" 
                  tick={{ fontSize: 12, fill: '#475569' }} 
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12, fill: '#475569' }}
                />
                <Tooltip
                  formatter={(value: any) => [formatFullTHB(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="approvedAmount" name="อนุมัติ/โอนเงิน" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendingAmount" name="อยู่ระหว่างตรวจสอบ" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returnedAmount" name="ส่งคืนเอกสารแก้ไข" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                <div className="font-semibold text-slate-800">{m.monthName}</div>
                <div className="text-slate-500 mt-1">ยอดตั้งเบิก: <span className="font-semibold text-slate-900">{formatCurrency(m.totalAmount)}</span></div>
                <div className="text-emerald-600 font-medium">อนุมัติ: {formatCurrency(m.approvedAmount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART VIEW 2: CATEGORY BREAKDOWN */}
      {chartView === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatFullTHB(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              สัดส่วนประเภทรายการงบประมาณ
            </h3>
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2 max-w-[65%]">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-medium text-slate-800 truncate" title={cat.category}>
                    {cat.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatFullTHB(cat.amount)}</div>
                  <div className="text-slate-500 text-[11px]">{cat.count} รายการ ({cat.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART VIEW 3: DEPARTMENT BREAKDOWN */}
      {chartView === 'department' && (
        <div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={departmentData} margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }} />
                <Tooltip formatter={(value: any) => formatFullTHB(Number(value))} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="totalAmount" name="ยอดเบิกรวม" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="approvedAmount" name="อนุมัติแล้ว" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
