import React, { useState, useRef } from 'react';
import { AttachedFile } from '../types';
import { FilePreviewModal } from './FilePreviewModal';
import { Upload, FileText, Image as ImageIcon, Trash2, Eye, Paperclip, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileAttachmentSectionProps {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
  disabled?: boolean;
}

export const FileAttachmentSection: React.FC<FileAttachmentSectionProps> = ({
  files = [],
  onChange,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const processFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    setIsUploadingDrive(true);
    const pendingPromises: Promise<AttachedFile>[] = [];

    Array.from(fileList).forEach(file => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`ไฟล์ "${file.name}" มีขนาดใหญ่เกิน 10MB`);
        return;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
        setErrorMessage(`ไฟล์ "${file.name}" ไม่ใช่ประเภทไฟล์ที่รองรับ (รองรับเฉพาะ PDF, JPG, PNG, WEBP)`);
        return;
      }

      const promise = new Promise<AttachedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          let driveFileId: string | undefined;
          let driveWebViewLink: string | undefined;

          try {
            const uploadRes = await fetch('/api/google/upload-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
                dataUrl: dataUrl
              })
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.success) {
                driveFileId = uploadData.fileId;
                driveWebViewLink = uploadData.webViewLink;
              }
            }
          } catch (uploadErr) {
            console.log('Google Drive upload notice:', uploadErr);
          }

          resolve({
            id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
            size: file.size,
            dataUrl: dataUrl,
            uploadedAt: new Date().toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric'
            }),
            driveFileId,
            driveWebViewLink
          });
        };
        reader.onerror = () => {
          resolve({
            id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: '',
            uploadedAt: new Date().toLocaleDateString('th-TH')
          });
        };
        reader.readAsDataURL(file);
      });

      pendingPromises.push(promise);
    });

    if (pendingPromises.length > 0) {
      Promise.all(pendingPromises)
        .then(processed => {
          onChange([...files, ...processed]);
        })
        .catch(err => {
          console.error(err);
          setErrorMessage('เกิดข้อผิดพลาดในการอ่านไฟล์');
        })
        .finally(() => {
          setIsUploadingDrive(false);
        });
    } else {
      setIsUploadingDrive(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(files.filter(f => f.id !== idToRemove));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
          <span>เอกสาร/ไฟล์แนบประกอบ (PDF, JPG, PNG)</span>
          {files.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
              {files.length} ไฟล์
            </span>
          )}
        </label>
        <span className="text-[11px] text-slate-400">ขนาดสูงสุด 10MB ต่อไฟล์</span>
      </div>

      {/* Upload Dropzone */}
      {!disabled && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 shadow-inner'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Upload className="w-5 h-5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">
              <span className="text-blue-600 font-bold hover:underline">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์ PDF/JPG มาวางที่นี่
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์ประเภท PDF, JPG, JPEG, PNG, WEBP</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600 text-xs font-bold"
          >
            ตกลง
          </button>
        </div>
      )}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
          {files.map((file) => {
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            const isImage = file.type.startsWith('image/');

            return (
              <div
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="group relative flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition cursor-pointer overflow-hidden"
              >
                {/* Thumbnail / Icon */}
                <div className="shrink-0">
                  {isImage && file.dataUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      isPdf ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                    }`}>
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition">
                    {file.name}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-semibold text-slate-500 uppercase">{isPdf ? 'PDF' : isImage ? 'IMAGE' : 'FILE'}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    {file.driveFileId && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Google Drive
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="ดูตัวอย่าง"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFile(file.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};
