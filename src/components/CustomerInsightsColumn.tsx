import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Star, 
  Plus, 
  RefreshCw, 
  Share2, 
  Edit3, 
  AlertCircle, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Product, CustomerInsight, CATEGORIES } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface CustomerInsightsColumnProps {
  product: Product | null;
  onUpdateProduct: (updated: Product) => void;
  onSelectInsightForShots?: (insight: CustomerInsight) => void;
}

export const CustomerInsightsColumn: React.FC<CustomerInsightsColumnProps> = ({
  product,
  onUpdateProduct,
  onSelectInsightForShots,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomerInsight>>({});
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    angle: '',
    painPoint: '',
    benefit: '',
    viralHook: '',
    scriptIdea: '',
  });

  if (!product) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-8 items-center justify-center text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa chọn sản phẩm</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Chọn một sản phẩm từ danh sách bên trái để tạo và quản lý insight khách hàng cùng câu viral hook mở đầu video.
        </p>
      </div>
    );
  }

  const hasValidInfo = Boolean(
    product.name && product.name.trim().length > 2 &&
    product.info && product.info.trim().length >= 10
  );

  const insights = product.insights || [];

  const handleGenerateInsights = async (isLoadMore = false) => {
    if (!hasValidInfo) {
      setErrorMessage('Vui lòng điền Tên sản phẩm và Thông tin chi tiết ở Cột 2 trước khi tạo insight.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || '';
      
      if (!apiKey) {
        const userKey = window.prompt('Chưa tìm thấy API Key. Vui lòng nhập Google Gemini API Key của bạn vào đây:');
        if (userKey && userKey.trim()) {
          apiKey = userKey.trim();
          localStorage.setItem('GEMINI_API_KEY', apiKey);
        } else {
          throw new Error('Chưa có API Key của Gemini.');
        }
      }

      const googleAi = new GoogleGenAI({ apiKey });
      const categoryName = CATEGORIES[product.category]?.name || 'Trang trí nhà cửa';
      
      const existingText = isLoadMore && insights.length > 0 
        ? `Các insight đã có (hãy tạo các góc nhìn KHÁC biệt hoàn toàn):\n` + insights.map(i => `- ${i.angle}: ${i.viralHook}`).join('\n')
        : '';

      const promptText = `Bạn là chuyên gia marketing và sáng tạo nội dung TikTok/Reels triệu view. Hãy phân tích sản phẩm sau và tạo ra 10 insight khách hàng kèm theo câu Viral Hook mở đầu video cực kỳ thu hút.

Thông tin sản phẩm:
- Tên sản phẩm: ${product.name}
- Danh mục: ${categoryName}
- Thông tin chi tiết: ${product.info}

${existingText}

Yêu cầu trả về đúng định dạng JSON chuẩn gồm một mảng (array) chứa đúng 10 đối tượng, mỗi đối tượng có các trường sau:
- id: chuỗi định danh duy nhất (ví dụ: "ins_1", "ins_2"...)
- angle: góc tiếp cận / tệp khách hàng
- painPoint: nỗi đau / vấn đề thực tế của khách hàng
- benefit: lợi ích / giải pháp mà sản phẩm mang lại
- viralHook: câu hook mở đầu video trong 3-5 giây đầu tiên gây chú ý mạnh
- scriptIdea: gợi ý ngắn gọn cách triển khai cảnh quay tiếp theo`;

      const response = await googleAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                angle: { type: Type.STRING },
                painPoint: { type: Type.STRING },
                benefit: { type: Type.STRING },
                viralHook: { type: Type.STRING },
                scriptIdea: { type: Type.STRING },
              },
              required: ['id', 'angle', 'painPoint', 'benefit', 'viralHook'],
            },
          },
        },
      });

      const textResult = response.text || '';
      if (!textResult) {
        throw new Error('AI không trả về kết quả.');
      }

      const rawNewInsights = JSON.parse(textResult);
      const newInsights: CustomerInsight[] = rawNewInsights.map((item: any, idx: number) => ({
        id: item.id || `ins_${Date.now()}_${idx}`,
        angle: item.angle || 'Góc nhìn thực tế',
        painPoint: item.painPoint || '',
        benefit: item.benefit || '',
        viralHook: item.viralHook || '',
        scriptIdea: item.scriptIdea || '',
        isFavorite: false,
        createdAt: new Date().toISOString(),
      }));

      if (newInsights.length === 0) {
        throw new Error('AI chưa trả về insight, vui lòng thử lại.');
      }

      const updatedInsights = isLoadMore
        ? [...insights, ...newInsights]
        : [...newInsights, ...insights];

      onUpdateProduct({
        ...product,
        insights: updatedInsights,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Failed to generate insights:', err);
      setErrorMessage(err.message || 'Không thể tạo insight lúc này. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteInsight = (id: string) => {
    const updated = insights.filter((item) => item.id !== id);
    onUpdateProduct({
      ...product,
      insights: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleFavorite = (id: string) => {
    const updated = insights.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    onUpdateProduct({
      ...product,
      insights: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopyHook = (hookText: string, id: string) => {
    navigator.clipboard.writeText(hookText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullInsight = (ins: CustomerInsight) => {
    const text = `🎯 [${ins.angle}]\n🔥 VIRAL HOOK: "${ins.viralHook}"\n💔 Nỗi đau: ${ins.painPoint}\n✨ Lợi ích: ${ins.benefit}${ins.scriptIdea ? `\n🎬 Ý tưởng: ${ins.scriptIdea}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ins.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = () => {
    if (!editingInsightId) return;
    const updated = insights.map((item) =>
      item.id === editingInsightId ? ({ ...item, ...editForm } as CustomerInsight) : item
    );
    onUpdateProduct({
      ...product,
      insights: updated,
      updatedAt: new Date().toISOString(),
    });
    setEditingInsightId(null);
    setEditForm({});
  };

  const handleAddManualInsight = () => {
    if (!manualForm.viralHook.trim() && !manualForm.painPoint.trim()) return;

    const newIns: CustomerInsight = {
      id: `ins_manual_${Date.now()}`,
      angle: manualForm.angle.trim() || 'Góc nhìn thực tế',
      painPoint: manualForm.painPoint.trim(),
      benefit: manualForm.benefit.trim(),
      viralHook: manualForm.viralHook.trim(),
      scriptIdea: manualForm.scriptIdea.trim(),
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateProduct({
      ...product,
      insights: [newIns, ...insights],
      updatedAt: new Date().toISOString(),
    });

    setManualForm({ angle: '', painPoint: '', benefit: '', viralHook: '', scriptIdea: '' });
    setShowAddManual(false);
  };

  const displayedInsights = filterFavoriteOnly
    ? insights.filter((i) => i.isFavorite)
    : insights;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Header */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span>Insight Khách Hàng & Viral Hook</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 font-semibold">
                  {insights.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Đào sâu tâm lý, nỗi đau khách hàng & tạo câu hook giữ chân</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                filterFavoriteOnly
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFavoriteOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">Yêu thích</span>
            </button>

            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden xl:inline">Tự viết</span>
            </button>
          </div>
        </div>

        {/* Primary AI Generate Action Button */}
        <div className="mt-2">
          <button
            onClick={() => handleGenerateInsights(insights.length > 0)}
            disabled={!hasValidInfo || isGenerating}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGenerating
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse border border-rose-200'
                : hasValidInfo
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                <span>AI đang phân tích tâm lý & viết 10 Viral Hooks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{insights.length === 0 ? 'Tạo 10 Insight & Viral Hook AI' : 'Tạo Thêm 10 Insight Mới (AI)'}</span>
              </>
            )}
          </button>

          {!hasValidInfo && (
            <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 p-2 rounded-lg mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Nút sẽ hoạt động khi Cột 2 có <strong>Tên sản phẩm</strong> và <strong>Thông tin chi tiết</strong>.</span>
            </p>
          )}

          {errorMessage && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/80 border border-red-200 rounded-lg text-xs text-red-700 dark:text-red-200 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold text-[10px]">Đóng</button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddManual && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Viết Insight & Hook thủ công</span>
            <button onClick={() => setShowAddManual(false)} className="cursor-pointer">✕</button>
          </div>
          <input
            type="text"
            placeholder="Góc tiếp cận (VD: Tối ưu không gian, Tiết kiệm chi phí...)"
            value={manualForm.angle}
            onChange={(e) => setManualForm({ ...manualForm, angle: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Câu Viral Hook 3s mở đầu video... *"
            value={manualForm.viralHook}
            onChange={(e) => setManualForm({ ...manualForm, viralHook: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-rose-600"
          />
          <textarea
            rows={2}
            placeholder="Nỗi đau / vấn đề khách hàng..."
            value={manualForm.painPoint}
            onChange={(e) => setManualForm({ ...manualForm, painPoint: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <textarea
            rows={2}
            placeholder="Lợi ích / giải pháp thực tế..."
            value={manualForm.benefit}
            onChange={(e) => setManualForm({ ...manualForm, benefit: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowAddManual(false)} className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Hủy</button>
            <button onClick={handleAddManualInsight} className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium">Lưu Insight</button>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {displayedInsights.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {filterFavoriteOnly ? 'Chưa có insight yêu thích' : 'Chưa có insight nào cho sản phẩm này'}
            </p>
          </div>
        ) : (
          displayedInsights.map((ins, index) => {
            const isEditing = editingInsightId === ins.id;
            const isCopied = copiedId === ins.id;

            return (
              <div
                key={ins.id}
                className={`p-3.5 rounded-xl border transition-all relative ${
                  ins.isFavorite
                    ? 'bg-rose-50/70 dark:bg-slate-800 border-rose-400 dark:border-rose-500 border-l-4 border-l-rose-500'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                      #{index + 1} {ins.angle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleFavorite(ins.id)} className={`p-1 rounded-md ${ins.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-slate-400'}`}>
                      <Star className={`w-3.5 h-3.5 ${ins.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button onClick={() => { if (isEditing) { setEditingInsightId(null); } else { setEditingInsightId(ins.id); setEditForm({ ...ins }); } }} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleCopyFullInsight(ins)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteInsight(ins.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-md">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <input type="text" value={editForm.angle || ''} onChange={(e) => setEditForm({ ...editForm, angle: e.target.value })} className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 rounded-lg text-xs" />
                    <input type="text" value={editForm.viralHook || ''} onChange={(e) => setEditForm({ ...editForm, viralHook: e.target.value })} className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600" />
                    <textarea rows={2} value={editForm.painPoint || ''} onChange={(e) => setEditForm({ ...editForm, painPoint: e.target.value })} className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 rounded-lg text-xs" />
                    <textarea rows={2} value={editForm.benefit || ''} onChange={(e) => setEditForm({ ...editForm, benefit: e.target.value })} className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 rounded-lg text-xs" />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button onClick={() => setEditingInsightId(null)} className="px-2.5 py-1 bg-slate-200 rounded-lg text-xs">Hủy</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-semibold">Lưu</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-slate-900 border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span>Viral Hook 3-5s Mở Đầu:</span>
                        </span>
                        <button
                          onClick={() => handleCopyHook(ins.viralHook, ins.id)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isCopied ? <><Check className="w-3 h-3" /><span>Copied!</span></> : <><Copy className="w-3 h-3" /><span>Copy Hook</span></>}
                        </button>
                      </div>
                      <p className="text-xs sm:text-[13px] font-bold text-rose-900 dark:text-rose-100 leading-relaxed">
                        "{ins.viralHook}"
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                        <span className="text-rose-500 shrink-0 font-bold text-[11px]">💔 Nỗi đau:</span>
                        <span className="text-[12px] leading-relaxed">{ins.painPoint}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                        <span className="text-emerald-600 shrink-0 font-bold text-[11px]">✨ Lợi ích:</span>
                        <span className="text-[12px] leading-relaxed">{ins.benefit}</span>
                      </div>
                      {ins.scriptIdea && (
                        <div className="flex items-start gap-1.5 text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-amber-600 shrink-0 font-bold text-[11px]">🎬 Gợi ý:</span>
                          <span className="text-[11px] italic">{ins.scriptIdea}</span>
                        </div>
                      )}
                    </div>

                    {onSelectInsightForShots && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onSelectInsightForShots(ins)}
                          className="text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lên cảnh quay video theo hook này</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between shrink-0">
        <span>Tổng cộng: <strong className="text-slate-800 dark:text-slate-200">{insights.length}</strong> insight</span>
        {insights.length > 0 && (
          <button onClick={() => handleGenerateInsights(true)} disabled={isGenerating} className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Tạo thêm 10 insight</span>
          </button>
        )}
      </div>

    </div>
  );
};
