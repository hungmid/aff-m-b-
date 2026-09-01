import React from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Flame, 
  Clapperboard, 
  Layers, 
  FileText 
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-['Quicksand']">
                Hướng Dẫn Quy Trình 4 Cột
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quy trình sản xuất video Affiliate Mẹ & Bé triệu view</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-bold text-rose-700 dark:text-rose-300 text-xs">Cột 1: Danh sách sản phẩm</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Phân loại theo 4 hạng mục: Đồ dùng mẹ, Đồ vệ sinh chăm sóc bé, Quần áo bé, Đồ chơi bé. Sắp xếp theo A-Z hoặc thời gian thêm. Chọn sản phẩm để mở thông tin chi tiết.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Cột 2: Thông tin chi tiết sản phẩm</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Điền tên, link affiliate, giá bán và đặc biệt là <strong>Thông tin công dụng & đặc điểm</strong>. Càng chi tiết thì AI phân tích tâm lý khách hàng ở Cột 3 càng đắt giá!
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Cột 3: Insight Khách Hàng & Viral Hook</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Bấm <strong>"✨ Tạo 10 Insight & Viral Hook AI"</strong>. AI sẽ đào sâu vào nỗi đau thầm kín của mẹ bỉm (con quấy khóc, hăm tã, stress, sợ đồ dơ...) và tạo 10 câu hook 3-5s mở đầu giữ chân người xem.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Cột 4: Cảnh quay đẹp tư liệu dựng video</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Điền hoặc bấm <strong>"Gợi ý Cảnh Quay AI"</strong> để có trọn bộ B-roll (góc cận, POV, unboxing, test thực tế). Sau đó bấm <strong>"Xuất Kịch Bản Hoàn Chỉnh"</strong> để copy trọn bộ đi quay video ngay!
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
              <strong>Lưu trữ an toàn 100%:</strong> Toàn bộ dữ liệu bạn nhập được lưu trực tiếp vào bộ nhớ máy tính. Bạn có thể bấm F5 hoặc mở lại ứng dụng bất cứ lúc nào mà không lo bị mất!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            Đã hiểu, bắt đầu thôi!
          </button>
        </div>

      </div>
    </div>
  );
};
