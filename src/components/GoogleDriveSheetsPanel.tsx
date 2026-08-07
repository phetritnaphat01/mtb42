import React from 'react';
import { FileSpreadsheet, ExternalLink, CheckCircle, HardDrive, LogOut, FileDown } from 'lucide-react';

interface GoogleDriveSheetsPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onExport: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExporting: boolean;
  lastSpreadsheetUrl?: string;
}

export const GoogleDriveSheetsPanel: React.FC<GoogleDriveSheetsPanelProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  onExport,
  onExportExcel,
  onExportPdf,
  isExporting,
  lastSpreadsheetUrl
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-950 text-white rounded-xl p-5 my-6 border border-emerald-500/30 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Status */}
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">
                การส่งออกเอกสาร & การเชื่อมต่อ Google Drive
              </h3>
              {isConnected ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> เชื่อมต่อ Drive แล้ว
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  ส่งออกไฟล์ได้ทันที
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              รองรับการส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx), PDF (.pdf) และส่งออกไปยัง Google Sheets
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 border border-emerald-400/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Excel</span>
            </button>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 border border-rose-400/40"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          )}

          {!isConnected ? (
            <button
              onClick={onConnect}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>เชื่อมต่อ Google Drive</span>
            </button>
          ) : (
            <>
              <button
                onClick={onExport}
                disabled={isExporting}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50 border border-teal-400/40"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isExporting ? 'กำลังสร้าง...' : 'สร้าง Google Sheet'}</span>
              </button>

              {lastSpreadsheetUrl && (
                <a
                  href={lastSpreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5 border border-blue-400/30"
                >
                  <span>เปิดใน Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={onDisconnect}
                title="ยกเลิกการเชื่อมต่อ"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
