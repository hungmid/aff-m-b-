import React, { useState } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Camera, 
  Edit3, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Type, 
  Film,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Video,
  ListOrdered
} from 'lucide-react';
import { Product, VideoShot, CustomerInsight, CATEGORIES } from '../types';

interface VideoShotsColumnProps {
  product: Product | null;
  onUpdateProduct: (updated: Product) => void;
  onOpenExportScriptModal: () => void;
  selectedInsightForShots?: CustomerInsight | null;
}

export const VideoShotsColumn: React.FC<VideoShotsColumnProps> = ({
  product,
  onUpdateProduct,
  onOpenExportScriptModal,
  selectedInsightForShots,
}) => {
  const [isSuggestingShots, setIsSuggestingShots] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<VideoShot>>({});
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualForm, setManualForm] = useState<Partial<VideoShot>>({
    title: '',
    description: '',
    shotType: 'Cận cảnh (Close-up)',
    durationSeconds: 3,
    onScreenText: '',
    propOrNote: '',
  });

  if (!product) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-8 items-center justify-center text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mb-4">
          <Clapperboard className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa chọn sản phẩm</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Chọn một sản phẩm để quản lý các cảnh quay đẹp, hấp dẫn làm tư liệu dựng video TikTok/Reels/Shorts.
        </p>
      </div>
    );
  }

  const shots = product.shots || [];
  const filmedCount = shots.filter((s) => s.status === 'filmed').length;

  const handleToggleFilmed = (id: string) => {
    const updated = shots.map((s) =>
      s.id === id ? { ...s, status: (s.status === 'filmed' ? 'pending' : 'filmed') as 'pending' | 'filmed' } : s
    );
    onUpdateProduct({
      ...product,
      shots: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteShot = (id: string) => {
    const updated = shots.filter((s) => s.id !== id);
    onUpdateProduct({
      ...product,
      shots: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSuggestShotsAI = async () => {
    setIsSuggestingShots(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/shots/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          productInfo: product.info,
          category: CATEGORIES[product.category]?.name || 'Mẹ và Bé',
          selectedInsight: selectedInsightForShots || product.insights?.[0] || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi khi gọi AI gợi ý cảnh quay');
      }

      const data = await response.json();
      const newShots: VideoShot[] = data.shots || [];

      onUpdateProduct({
        ...product,
        shots: [...shots, ...newShots],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Failed to suggest shots:', err);
      setErrorMessage(err.message || 'Không thể tạo gợi ý cảnh quay');
    } finally {
      setIsSuggestingShots(false);
    }
  };

  const handleAddManualShot = () => {
    if (!manualForm.title?.trim() && !manualForm.description?.trim()) return;

    const newShot: VideoShot = {
      id: `shot_${Date.now()}`,
      title: manualForm.title?.trim() || `Cảnh quay #${shots.length + 1}`,
      description: manualForm.description?.trim() || '',
      shotType: manualForm.shotType || 'Cận cảnh (Close-up)',
      durationSeconds: Number(manualForm.durationSeconds) || 3,
      onScreenText: manualForm.onScreenText?.trim() || '',
      propOrNote: manualForm.propOrNote?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onUpdateProduct({
      ...product,
      shots: [...shots, newShot],
      updatedAt: new Date().toISOString(),
    });

    setManualForm({
      title: '',
      description: '',
      shotType: 'Cận cảnh (Close-up)',
      durationSeconds: 3,
      onScreenText: '',
      propOrNote: '',
    });
    setShowAddManual(false);
  };

  const handleSaveEdit = () => {
    if (!editingShotId) return;
    const updated = shots.map((s) =>
      s.id === editingShotId ? ({ ...s, ...editForm } as VideoShot) : s
    );
    onUpdateProduct({
      ...product,
      shots: updated,
      updatedAt: new Date().toISOString(),
    });
    setEditingShotId(null);
    setEditForm({});
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Header */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs dark:border-rose-800/70">
              4
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-['Quicksand']">
                <span>Cảnh Quay Đẹp Dựng Video</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 font-semibold dark:border-rose-800/70">
                  {filmedCount}/{shots.length} Đã quay
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tư liệu B-roll, góc quay chi tiết & kịch bản visual</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Thêm cảnh quay thủ công"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span className="hidden xl:inline">Thêm cảnh</span>
            </button>
          </div>
        </div>

        {/* Selected insight context banner */}
        {selectedInsightForShots && (
          <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs flex items-center justify-between">
            <div className="truncate">
              <span className="font-bold text-rose-600 dark:text-rose-400">Đang chọn Hook: </span>
              <span className="text-slate-700 dark:text-slate-300 italic">"{selectedInsightForShots.viralHook}"</span>
            </div>
          </div>
        )}

        {/* Action buttons: AI Suggest Shots & Export Script */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <button
            onClick={handleSuggestShotsAI}
            disabled={isSuggestingShots}
            className="py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {isSuggestingShots ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang lên góc quay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Gợi ý Cảnh Quay AI</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenExportScriptModal}
            className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Xuất Kịch Bản Video</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 dark:text-red-400 text-[10px] font-bold">✕</button>
          </div>
        )}
      </div>

      {/* Manual Add Form Panel */}
      {showAddManual && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Thêm cảnh quay mới</span>
            <button onClick={() => setShowAddManual(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Tên cảnh quay:</label>
              <input
                type="text"
                placeholder="VD: Cận cảnh phễu silicon mềm mại..."
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Góc quay:</label>
              <select
                value={manualForm.shotType}
                onChange={(e) => setManualForm({ ...manualForm, shotType: e.target.value })}
                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="Cận cảnh (Close-up)">Cận cảnh (Close-up)</option>
                <option value="Cận cảnh chi tiết (Macro)">Cận cảnh chi tiết (Macro)</option>
                <option value="Góc nhìn người thứ nhất (POV)">Góc nhìn người thứ nhất (POV)</option>
                <option value="Toàn cảnh (Wide Shot)">Toàn cảnh (Wide Shot)</option>
                <option value="Góc nghiêng 45 độ (Medium)">Góc nghiêng 45 độ (Medium)</option>
                <option value="Flatlay từ trên xuống">Flatlay từ trên xuống</option>
                <option value="Reaction biểu cảm">Reaction biểu cảm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Mô tả hành động trong khung hình:</label>
            <textarea
              rows={2}
              placeholder="VD: Dùng tay bóp nhẹ vào phễu để thấy độ mềm dẻo..."
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Chữ chèn video (Text overlay):</label>
              <input
                type="text"
                placeholder="VD: Silicon y tế siêu mềm..."
                value={manualForm.onScreenText}
                onChange={(e) => setManualForm({ ...manualForm, onScreenText: e.target.value })}
                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-rose-600 dark:text-rose-300 font-medium placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Thời lượng (giây):</label>
              <input
                type="number"
                min={1}
                max={60}
                value={manualForm.durationSeconds}
                onChange={(e) => setManualForm({ ...manualForm, durationSeconds: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Đạo cụ / Ghi chú quay:</label>
            <input
              type="text"
              placeholder="VD: Ánh sáng tự nhiên, chuẩn bị nước sôi..."
              value={manualForm.propOrNote}
              onChange={(e) => setManualForm({ ...manualForm, propOrNote: e.target.value })}
              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddManual(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleAddManualShot}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-xs cursor-pointer"
            >
              Lưu cảnh quay
            </button>
          </div>
        </div>
      )}

      {/* Shots List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {shots.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mx-auto mb-3">
              <Clapperboard className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có cảnh quay tư liệu nào</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Hãy bấm <strong>"Gợi ý Cảnh Quay AI"</strong> hoặc ấn nút <strong>"Thêm cảnh"</strong> để lập danh sách các góc quay đắt giá làm tư liệu dựng video triệu view!
            </p>
            <button
              onClick={handleSuggestShotsAI}
              className="mt-3 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Gợi ý cảnh quay bằng AI ngay</span>
            </button>
          </div>
        ) : (
          shots.map((shot, index) => {
            const isFilmed = shot.status === 'filmed';
            const isEditing = editingShotId === shot.id;

            return (
              <div
                key={shot.id}
                id={`shot-card-${shot.id}`}
                className={`p-3 rounded-xl border transition-all relative ${
                  isFilmed
                    ? 'bg-emerald-50/50 dark:bg-slate-800/80 border-emerald-300 dark:border-emerald-700/70 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                }`}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Tên cảnh quay:</label>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Góc quay:</label>
                        <input
                          type="text"
                          value={editForm.shotType || ''}
                          onChange={(e) => setEditForm({ ...editForm, shotType: e.target.value })}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Thời lượng (giây):</label>
                        <input
                          type="number"
                          value={editForm.durationSeconds || 3}
                          onChange={(e) => setEditForm({ ...editForm, durationSeconds: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Mô tả hành động:</label>
                      <textarea
                        rows={2}
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Chữ chèn màn hình:</label>
                      <input
                        type="text"
                        value={editForm.onScreenText || ''}
                        onChange={(e) => setEditForm({ ...editForm, onScreenText: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button onClick={() => setEditingShotId(null)} className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer">Hủy</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">Lưu</button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Filmed toggle checkbox */}
                        <button
                          onClick={() => handleToggleFilmed(shot.id)}
                          className="cursor-pointer text-rose-500 dark:text-rose-400 hover:scale-110 transition-transform"
                          title={isFilmed ? 'Đánh dấu chưa quay' : 'Đánh dấu đã quay xong'}
                        >
                          {isFilmed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500 hover:text-rose-500" />
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isFilmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/70' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/70'}`}>
                            Shot {index + 1}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {shot.shotType}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{shot.durationSeconds}s</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingShotId(shot.id);
                            setEditForm({ ...shot });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          title="Sửa cảnh quay"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShot(shot.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                          title="Xóa cảnh quay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-xs font-bold ${isFilmed ? 'line-through text-slate-400 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {shot.title}
                    </h4>

                    <p className="text-[12px] text-slate-600 dark:text-slate-200 mt-1 leading-relaxed">
                      {shot.description}
                    </p>

                    {shot.onScreenText && (
                      <div className="mt-2 p-1.5 rounded-lg bg-rose-50/80 dark:bg-slate-900/90 border border-rose-200/80 dark:border-rose-800/80 text-[11px] text-rose-800 dark:text-rose-200 flex items-start gap-1">
                        <Type className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Text chèn video:</strong> "{shot.onScreenText}"</span>
                      </div>
                    )}

                    {shot.propOrNote && (
                      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-300 italic">
                        💡 Lưu ý/Đạo cụ: {shot.propOrNote}
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
        <span>Tiến độ: <strong className="text-emerald-600 dark:text-emerald-400">{filmedCount}</strong>/{shots.length} cảnh</span>
        <button
          onClick={onOpenExportScriptModal}
          className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Film className="w-3 h-3 text-rose-500 dark:text-rose-400" />
          <span>Xem kịch bản video</span>
        </button>
      </div>

    </div>
  );
};
