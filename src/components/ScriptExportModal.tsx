import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Film, 
  Flame, 
  Printer, 
  Share2, 
  Clock, 
  Clapperboard, 
  Sparkles,
  Download
} from 'lucide-react';
import { Product, CustomerInsight, VideoShot, CATEGORIES } from '../types';

interface ScriptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedInsight?: CustomerInsight | null;
}

export const ScriptExportModal: React.FC<ScriptExportModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedInsight,
}) => {
  const [copied, setCopied] = useState(false);
  const [chosenInsightId, setChosenInsightId] = useState<string>(
    selectedInsight?.id || product?.insights?.[0]?.id || ''
  );

  if (!isOpen || !product) return null;

  const insights = product.insights || [];
  const shots = product.shots || [];
  const activeInsight = insights.find((i) => i.id === chosenInsightId) || insights[0] || null;

  const totalDuration = shots.reduce((acc, s) => acc + (s.durationSeconds || 3), 0) + 3; // +3s for hook

  // Generate full text script for 1-click copying
  const generateScriptText = () => {
    let text = `========================================\n`;
    text += `🎬 KỊCH BẢN VIDEO AFFILIATE MẸ & BÉ\n`;
    text += `Sản phẩm: ${product.name}\n`;
    text += `Hạng mục: ${CATEGORIES[product.category]?.name || 'Mẹ và Bé'}\n`;
    if (product.price) text += `Giá: ${product.price}\n`;
    if (product.shopeeUrl) text += `Link Shopee (${product.shopeeCommission || 'Hoa hồng'}): ${product.shopeeUrl}\n`;
    if (product.tiktokUrl) text += `Link TikTok Shop (${product.tiktokCommission || 'Hoa hồng'}): ${product.tiktokUrl}\n`;
    if (!product.shopeeUrl && !product.tiktokUrl && product.affiliateUrl) text += `Link mua: ${product.affiliateUrl}\n`;
    text += `Tổng thời lượng ước tính: ~${totalDuration} giây\n`;
    text += `========================================\n\n`;

    if (activeInsight) {
      text += `🔥 [0s - 3s] VIRAL HOOK MỞ ĐẦU (GIỮ CHÂN NGƯỜI XEM):\n`;
      text += `"${activeInsight.viralHook}"\n\n`;
      text += `💔 NỖI ĐAU KHÁCH HÀNG:\n${activeInsight.painPoint}\n\n`;
      text += `✨ LỢI ÍCH & GIẢI PHÁP SẢN PHẨM MANG LẠI:\n${activeInsight.benefit}\n\n`;
    }

    text += `----------------------------------------\n`;
    text += `📋 DANH SÁCH CẢNH QUAY TƯ LIỆU DỰNG VIDEO (B-ROLL):\n`;
    text += `----------------------------------------\n`;

    if (shots.length === 0) {
      text += `(Chưa có danh sách cảnh quay. Hãy thêm cảnh quay ở Cột 4)\n`;
    } else {
      shots.forEach((s, idx) => {
        text += `\n🎥 CẢNH ${idx + 1}: ${s.title} (${s.durationSeconds}s) [${s.shotType}]\n`;
        text += `• Hành động trong khung hình: ${s.description}\n`;
        if (s.onScreenText) text += `• Chữ chèn video (Text Overlay): "${s.onScreenText}"\n`;
        if (s.propOrNote) text += `• Đạo cụ / Ghi chú: ${s.propOrNote}\n`;
      });
    }

    text += `\n----------------------------------------\n`;
    text += `🎯 KÊU GỌI HÀNH ĐỘNG (CTA CUỐI VIDEO):\n`;
    text += `"Mẹ nào cần em này thì bấm ngay vào giỏ hàng góc trái video / link bio để nhận giá ưu đãi nhé!"\n`;
    text += `========================================\n`;

    return text;
  };

  const handleCopyScript = () => {
    const text = generateScriptText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center shadow-2xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-['Quicksand']">
                Kịch Bản Video Affiliate Hoàn Chỉnh
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {product.name} • ~{totalDuration} giây
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Select Insight Hook */}
          {insights.length > 1 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl">
              <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                Chọn câu Viral Hook làm mở đầu video:
              </label>
              <select
                value={chosenInsightId}
                onChange={(e) => setChosenInsightId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/80 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {insights.map((ins, idx) => (
                  <option key={ins.id} value={ins.id} className="bg-white dark:bg-slate-900">
                    #{idx + 1} [{ins.angle}] "{ins.viralHook.substring(0, 70)}..."
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Viral Hook */}
          {activeInsight ? (
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>PHẦN 1: VIRAL HOOK MỞ ĐẦU (0s - 3s Giữ Chân Khán GiẢ)</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-sm sm:text-base font-bold text-rose-900 dark:text-rose-100 leading-relaxed font-['Quicksand'] mb-3">
                "{activeInsight.viralHook}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">💔 Nỗi đau chạm đúng tim đen:</span>
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{activeInsight.painPoint}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">✨ Lợi ích giải phóng mẹ bỉm:</span>
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{activeInsight.benefit}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              Chưa có Viral Hook nào. Hãy ấn tạo insight ở Cột 3 trước!
            </div>
          )}

          {/* Section 2: Shot list */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-300 font-bold uppercase tracking-wider text-[11px]">
                <Clapperboard className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>PHẦN 2: TRÌNH TỰ CÁC CẢNH QUAY DỰNG VIDEO (B-ROLL)</span>
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {shots.length} cảnh quay • {totalDuration - 3}s
              </span>
            </div>

            {shots.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-center py-4">
                Chưa có cảnh quay nào trong danh sách. Hãy thêm hoặc bấm "Gợi ý Cảnh Quay AI" ở Cột 4.
              </p>
            ) : (
              <div className="space-y-2.5">
                {shots.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{s.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">{s.shotType}</span>
                        <span>{s.durationSeconds}s</span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 pl-7">{s.description}</p>

                    {s.onScreenText && (
                      <div className="pl-7 text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                        💬 Chữ chèn: "{s.onScreenText}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Call to action */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
              📣 PHẦN 3: KÊU GỌI HÀNH ĐỘNG (CTA KẾT VIDEO - 3s):
            </span>
            <p className="text-slate-700 dark:text-slate-300 italic">
              "Mẹ nào cần em này thì bấm ngay vào góc trái video / link bio để nhận ưu đãi nhé, đang có mã giảm sâu đó ạ!"
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>In kịch bản</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleCopyScript}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã Copy Kịch Bản!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Trọn Bộ Kịch Bản</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
