import React from 'react';
import { 
  Baby, 
  Sparkles, 
  Plus, 
  Download, 
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  products: Product[];
  activeProduct: Product | null;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenHelpModal: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  viewMode: 'columns' | 'grid';
  onToggleViewMode: () => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  onResetFontScale: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBackupModal,
  onOpenHelpModal,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shrink-0 z-30 shadow-xs transition-colors duration-200">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between gap-2.5">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-xs shadow-rose-200 dark:shadow-none shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight font-['Quicksand']">
                  Mom & Baby Affiliate
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> AI Creator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Quản lý sản phẩm • Đào sâu Insight khách hàng • Tạo Viral Hook & Kịch bản cảnh quay video
              </p>
            </div>
          </div>

          {/* Cleaned Controls: Chỉ giữ lại nút Chuyển Sáng/Tối, Sao lưu và Trợ giúp */}
          <div className="flex items-center gap-2">
            
            {/* EYE-FRIENDLY THEME TOGGLE BUTTON */}
            <button
              type="button"
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Chuyển sang Chế độ Tối Êm Dịu' : 'Chuyển sang Chế độ Sáng Êm Dịu'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              id="btn-backup-storage"
              onClick={onOpenBackupModal}
              title="Sao lưu & Khôi phục dữ liệu JSON máy tính"
              className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
              <span className="hidden sm:inline">Sao lưu/Khôi phục</span>
            </button>

            <button
              id="btn-help-guide"
              onClick={onOpenHelpModal}
              title="Hướng dẫn sử dụng"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
