import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types';
import { exportDataAsJSON, importDataFromJSON } from '../utils/storage';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRestoreProducts: (products: Product[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  products,
  onRestoreProducts,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJSON(products);
    setStatusMessage({
      type: 'success',
      text: 'Đã xuất file JSON backup thành công vào thư mục Tải về (Downloads)!',
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importDataFromJSON(file);
      onRestoreProducts(imported);
      setStatusMessage({
        type: 'success',
        text: `Đã khôi phục thành công ${imported.length} sản phẩm từ file backup!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi khi đọc file backup JSON',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetToSample = () => {
    onRestoreProducts(INITIAL_PRODUCTS);
    setShowResetConfirm(false);
    setStatusMessage({
      type: 'success',
      text: 'Đã khôi phục dữ liệu mẫu Mẹ & Bé thành công!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center shadow-2xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-['Quicksand']">
                Sao Lưu & Lưu Trữ Dữ Liệu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lưu an toàn trong bộ nhớ máy tính (Local Persistence)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Local storage badge */}
          <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-slate-800 dark:text-slate-200">
              <p className="font-bold text-xs text-rose-700 dark:text-rose-300">Dữ liệu được lưu tự động trên máy</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Tất cả thông tin sản phẩm, insight AI và cảnh quay đã nhập luôn được lưu trữ trên trình duyệt của máy bạn, F5 hay mở lại tab đều nguyên vẹn 100%.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action 1: Export JSON */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Xuất File Backup (JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tải toàn bộ {products.length} sản phẩm về lưu trên máy tính
                </p>
              </div>

              <button
                onClick={handleExport}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Tải file về
              </button>
            </div>
          </div>

          {/* Action 2: Import JSON */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Khôi Phục Từ File Backup</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Nhập file JSON đã sao lưu trước đó
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  Chọn file JSON
                </button>
              </div>
            </div>
          </div>

          {/* Action 3: Reset to sample */}
          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
            {showResetConfirm ? (
              <div className="space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                  Bạn có chắc chắn muốn khôi phục về danh sách mẫu ban đầu không? (Dữ liệu tự nhập sẽ bị thay thế)
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleResetToSample}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Đồng ý khôi phục mẫu
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Nạp Lại Dữ Liệu Mẫu</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Khôi phục 4 sản phẩm mẫu chuẩn ngành Mẹ & Bé
                  </p>
                </div>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Khôi phục mẫu
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
