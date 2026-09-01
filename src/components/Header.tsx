import React, { useState } from 'react';
import { 
  Baby, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Clapperboard, 
  Lightbulb, 
  Package, 
  HelpCircle,
  CheckCircle2,
  Columns4,
  LayoutGrid,
  Type,
  Minus,
  Sliders,
  ALargeSmall,
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
  products,
  activeProduct,
  onOpenAddModal,
  onOpenBackupModal,
  onOpenHelpModal,
  searchTerm,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  fontScale,
  onFontScaleChange,
  onResetFontScale,
  theme,
  onToggleTheme,
}) => {
  const totalInsights = products.reduce((acc, p) => acc + (p.insights?.length || 0), 0);
  const totalShots = products.reduce((acc, p) => acc + (p.shots?.length || 0), 0);
  const [showFontPresets, setShowFontPresets] = useState(false);

  const presets = [
    { label: 'Nhỏ', value: 90 },
    { label: 'Chuẩn', value: 100 },
    { label: 'Vừa', value: 110 },
    { label: 'Lớn', value: 120 },
    { label: 'Rất lớn', value: 135 },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shrink-0 z-30 shadow-xs transition-colors duration-200">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5">
          
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

          {/* Quick Metrics Bar & Storage Indicator */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <Package className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-rose-800 dark:text-rose-200">{products.length}</span>
              <span className="text-rose-600/80 dark:text-rose-400/80">sản phẩm</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-amber-900 dark:text-amber-200">{totalInsights}</span>
              <span className="text-amber-700/80 dark:text-amber-400/80">insight & hook</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 text-xs text-sky-800 dark:text-sky-300 font-medium">
              <Clapperboard className="w-3.5 h-3.5 text-sky-500" />
              <span className="font-bold text-sky-900 dark:text-sky-200">{totalShots}</span>
              <span className="text-sky-700/80 dark:text-sky-400/80">cảnh quay</span>
            </div>

            {/* Signature Warm Organic Storage Pill */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/70">
              <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Local Storage</span>
            </div>
          </div>

          {/* Controls: Font Size Slider + Theme Toggle + Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* FONT SIZE SCALING SLIDER TOOLBAR */}
            <div 
              className="relative flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-2xs group"
              title="Thanh kéo phóng to / thu nhỏ kích thước chữ toàn bộ giao diện"
            >
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <ALargeSmall className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:inline">Cỡ chữ:</span>
              </div>

              {/* Decrease button */}
              <button
                type="button"
                onClick={() => onFontScaleChange(Math.max(85, fontScale - 5))}
                disabled={fontScale <= 85}
                title="Giảm kích thước chữ (-5%)"
                className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all text-xs font-bold shadow-2xs"
              >
                <Minus className="w-3 h-3" />
              </button>

              {/* Smooth Range Slider */}
              <div className="flex items-center">
                <input
                  id="range-font-scale"
                  type="range"
                  min="85"
                  max="140"
                  step="5"
                  value={fontScale}
                  onChange={(e) => onFontScaleChange(Number(e.target.value))}
                  className="w-16 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Increase button */}
              <button
                type="button"
                onClick={() => onFontScaleChange(Math.min(140, fontScale + 5))}
                disabled={fontScale >= 140}
                title="Tăng kích thước chữ (+5%)"
                className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all text-xs font-bold shadow-2xs"
              >
                <Plus className="w-3 h-3" />
              </button>

              {/* Percentage Badge & Reset */}
              <div className="flex items-center gap-1">
                <span 
                  onClick={() => setShowFontPresets(!showFontPresets)}
                  className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono font-bold text-rose-600 dark:text-rose-300 cursor-pointer hover:border-rose-400 select-none shadow-2xs"
                  title="Nhấp để chọn nhanh các mức cỡ chữ mẫu"
                >
                  {fontScale}%
                </span>

                {fontScale !== 100 && (
                  <button
                    type="button"
                    onClick={onResetFontScale}
                    title="Đặt lại cỡ chữ chuẩn 100%"
                    className="p-0.5 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Quick Presets Dropdown */}
              {showFontPresets && (
                <div 
                  className="absolute right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowFontPresets(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mức cỡ chữ
                  </div>
                  {presets.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        onFontScaleChange(p.value);
                        setShowFontPresets(false);
                      }}
                      className={`px-2.5 py-1.5 text-xs rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
                        fontScale === p.value
                          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">{p.value}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
              id="btn-add-product-header"
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs shadow-rose-200 dark:shadow-none transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
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

