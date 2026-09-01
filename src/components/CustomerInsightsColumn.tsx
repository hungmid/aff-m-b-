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
  HelpCircle,
  MessageSquareQuote,
  Flame,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Product, CustomerInsight, CATEGORIES } from '../types';

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

  // Check if product has enough info
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
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          productInfo: product.info,
          category: CATEGORIES[product.category]?.name || 'Mẹ và Bé',
          existingInsights: isLoadMore ? insights : [],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi từ máy chủ khi tạo insight');
      }

      const data = await response.json();
      const newInsights: CustomerInsight[] = data.insights || [];

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
    const text = `🎯 [${ins.angle}]\n🔥 VIRAL HOOK: "${ins.viralHook}"\n💔 Nỗi đau khách hàng: ${ins.painPoint}\n✨ Lợi ích giải pháp: ${ins.benefit}${ins.scriptIdea ? `\n🎬 Ý tưởng kịch bản: ${ins.scriptIdea}` : ''}`;
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
      angle: manualForm.angle.trim() || 'Góc nhìn mẹ bỉm',
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

    setManualForm({
      angle: '',
      painPoint: '',
      benefit: '',
      viralHook: '',
      scriptIdea: '',
    });
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
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs dark:border-rose-800/70">
              3
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-['Quicksand']">
                <span>Insight Khách Hàng & Viral Hook</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 font-semibold dark:border-rose-800/70">
                  {insights.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Đào sâu tâm lý, nỗi đau mẹ bỉm & tạo câu hook giữ chân</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                filterFavoriteOnly
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/70 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Lọc chỉ xem các insight đã đánh dấu sao yêu thích"
            >
              <Star className={`w-3.5 h-3.5 ${filterFavoriteOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="hidden xl:inline">Yêu thích</span>
            </button>

            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              title="Thêm insight thủ công"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span className="hidden xl:inline">Tự viết</span>
            </button>
          </div>
        </div>

        {/* Primary AI Generate Action Button */}
        <div className="mt-2">
          <button
            id="btn-generate-ai-insights"
            onClick={() => handleGenerateInsights(insights.length > 0)}
            disabled={!hasValidInfo || isGenerating}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              isGenerating
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 cursor-wait animate-pulse border border-rose-200 dark:border-rose-800/70'
                : hasValidInfo
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-none active:scale-[0.98]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none'
            }`}
            title={!hasValidInfo ? 'Vui lòng điền thông tin sản phẩm ở Cột 2 trước' : 'Tạo 10 insight khách hàng và câu Viral Hook mở đầu video'}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500 dark:text-rose-400" />
                <span>AI đang phân tích tâm lý mẹ bỉm & viết 10 Viral Hooks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>
                  {insights.length === 0 ? 'Tạo 10 Insight & Viral Hook AI' : 'Tạo Thêm 10 Insight Mới (AI)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider font-semibold">
                  +10 Ý Tưởng
                </span>
              </>
            )}
          </button>

          {!hasValidInfo && (
            <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 p-2 rounded-lg mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Nút sẽ hoạt động khi Cột 2 có <strong>Tên sản phẩm</strong> và <strong>Thông tin chi tiết</strong>.</span>
            </p>
          )}

          {errorMessage && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-200 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-[10px] font-bold"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Form Panel */}
      {showAddManual && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Viết Insight & Hook thủ công</span>
            <button
              onClick={() => setShowAddManual(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Góc tiếp cận (VD: Nỗi lo rôm sảy, Ám ảnh tiếng ồn...)"
            value={manualForm.angle}
            onChange={(e) => setManualForm({ ...manualForm, angle: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          />
          <input
            type="text"
            placeholder="Câu Viral Hook 3s mở đầu video... *"
            value={manualForm.viralHook}
            onChange={(e) => setManualForm({ ...manualForm, viralHook: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          />
          <textarea
            rows={2}
            placeholder="Nỗi đau / tâm lý khách hàng..."
            value={manualForm.painPoint}
            onChange={(e) => setManualForm({ ...manualForm, painPoint: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          />
          <textarea
            rows={2}
            placeholder="Lợi ích / giải pháp thực tế..."
            value={manualForm.benefit}
            onChange={(e) => setManualForm({ ...manualForm, benefit: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddManual(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleAddManualInsight}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-xs cursor-pointer"
            >
              Lưu Insight
            </button>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {displayedInsights.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {filterFavoriteOnly ? 'Chưa có insight nào được đánh dấu yêu thích' : 'Chưa có insight nào cho sản phẩm này'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Ấn nút <strong>"Tạo 10 Insight & Viral Hook AI"</strong> ở trên để AI tự động phân tích tâm lý khách hàng và viết 10 câu hook mở đầu video triệu view!
            </p>
          </div>
        ) : (
          displayedInsights.map((ins, index) => {
            const isEditing = editingInsightId === ins.id;
            const isCopied = copiedId === ins.id;

            return (
              <div
                key={ins.id}
                id={`insight-card-${ins.id}`}
                className={`p-3.5 rounded-xl border transition-all relative ${
                  ins.isFavorite
                    ? 'bg-rose-50/70 dark:bg-slate-800 border-rose-400 dark:border-rose-500/80 shadow-xs border-l-4 border-l-rose-500'
                    : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                }`}
              >
                {/* Card Top: Angle Badge & Quick Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/70">
                      #{index + 1} {ins.angle}
                    </span>
                    {ins.isFavorite && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/70 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        <span>Đã lưu</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Favorite Star */}
                    <button
                      onClick={() => handleToggleFavorite(ins.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        ins.isFavorite
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900/80'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={ins.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                    >
                      <Star className={`w-3.5 h-3.5 ${ins.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingInsightId(null);
                        } else {
                          setEditingInsightId(ins.id);
                          setEditForm({ ...ins });
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                      title="Chỉnh sửa nội dung insight"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy full */}
                    <button
                      onClick={() => handleCopyFullInsight(ins)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                      title="Sao chép toàn bộ Insight & Hook"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteInsight(ins.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-md transition-colors cursor-pointer"
                      title="Xóa insight này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  /* Edit Form */
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Góc tiếp cận:</label>
                      <input
                        type="text"
                        value={editForm.angle || ''}
                        onChange={(e) => setEditForm({ ...editForm, angle: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 mb-0.5">Viral Hook mở đầu:</label>
                      <input
                        type="text"
                        value={editForm.viralHook || ''}
                        onChange={(e) => setEditForm({ ...editForm, viralHook: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nỗi đau khách hàng:</label>
                      <textarea
                        rows={2}
                        value={editForm.painPoint || ''}
                        onChange={(e) => setEditForm({ ...editForm, painPoint: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Lợi ích mang lại:</label>
                      <textarea
                        rows={2}
                        value={editForm.benefit || ''}
                        onChange={(e) => setEditForm({ ...editForm, benefit: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingInsightId(null)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Insight Content */
                  <div className="space-y-2">
                    
                    {/* VIRAL HOOK HIGHLIGHT BOX */}
                    <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-slate-900/90 border border-rose-200/80 dark:border-rose-800/80 shadow-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span>Viral Hook 3-5s Mở Đầu:</span>
                        </span>
                        
                        <button
                          onClick={() => handleCopyHook(ins.viralHook, ins.id)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-700/80 shadow-2xs'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Đã Copy!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Hook</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs sm:text-[13px] font-bold text-rose-900 dark:text-rose-100 leading-relaxed font-['Quicksand']">
                        "{ins.viralHook}"
                      </p>
                    </div>

                    {/* Pain Point & Benefit breakdown */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                        <span className="text-rose-500 dark:text-rose-400 shrink-0 font-bold text-[11px] mt-0.5">💔 Nỗi đau:</span>
                        <span className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-200">{ins.painPoint}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                        <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-[11px] mt-0.5">✨ Lợi ích:</span>
                        <span className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-200">{ins.benefit}</span>
                      </div>

                      {ins.scriptIdea && (
                        <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-300 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold text-[11px] mt-0.5">🎬 Gợi ý:</span>
                          <span className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-300 italic">{ins.scriptIdea}</span>
                        </div>
                      )}
                    </div>

                    {/* Action button to use in shots */}
                    {onSelectInsightForShots && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onSelectInsightForShots(ins)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/70 dark:hover:bg-rose-900/80 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/80 transition-colors flex items-center gap-1 cursor-pointer"
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
      <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
        <span>Tổng cộng: <strong className="text-slate-800 dark:text-slate-200">{insights.length}</strong> insight</span>
        {insights.length > 0 && (
          <button
            onClick={() => handleGenerateInsights(true)}
            disabled={isGenerating}
            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Tạo thêm 10 insight</span>
          </button>
        )}
      </div>

    </div>
  );
};
