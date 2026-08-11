import React, { useState } from 'react';
import { AttachedFile } from '../types';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface FilePreviewModalProps {
  file: AttachedFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-xl border ${isPdf ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base sm:text-lg text-white truncate">{file.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>แนบเมื่อ {file.uploadedAt || 'เมื่อซู่นี้'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 mr-2">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  title="ย่อ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-400">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  title="ขยาย"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  title="หมุนรูปภาพ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="h-9 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ดาวน์โหลดไฟล์</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-950/80 p-4 overflow-auto flex items-center justify-center relative">
          {isImage ? (
            <div className="flex items-center justify-center min-h-full min-w-full overflow-auto p-4">
              <img
                src={file.dataUrl}
                alt={file.name}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out'
                }}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-slate-800"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={file.dataUrl}
                title={file.name}
                className="w-full h-full rounded-lg border border-slate-800 bg-white"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-4">ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้ในเบราว์เซอร์</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลดเพื่อเปิดดู
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
