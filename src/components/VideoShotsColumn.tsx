import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Film, 
  Clock, 
  Camera,
  ArrowUpRight
} from 'lucide-react';
import { Product, BRollShot, CustomerInsight } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface VideoShotsColumnProps {
  product: Product | null;
  selectedInsight?: CustomerInsight | null;
  onUpdateProduct: (updated: Product) => void;
  onExportScript?: () => void;
}

export const VideoShotsColumn: React.FC<VideoShotsColumnProps> = ({
  product,
  selectedInsight,
  onUpdateProduct,
  onExportScript,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    visualDescription: '',
    cameraAngle: 'Góc cận (Close-up)',
    duration: '3s',
    audioNote: '',
  });

  if (!product) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-8 items-center justify-center text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mb-4">
          <Video className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa chọn sản phẩm</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Chọn sản phẩm và insight ở các cột trước để AI gợi ý kịch bản cảnh quay B-roll chi tiết.
        </p>
      </div>
    );
  }

  const shots = product.bRollShots || [];
  const hasInsights = product.insights && product.insights.length > 0;

  const handleGenerateShots = async () => {
    if (!hasInsights) {
      setErrorMessage('Vui lòng tạo ít nhất 1 Insight & Viral Hook ở Cột 3 trước khi gợi ý cảnh quay.');
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
      const targetInsight = selectedInsight || product.insights[0];

      const promptText = `Bạn là đạo diễn sản xuất video TikTok/Reels triệu view chuyên nghiệp. Người sáng tạo nội dung (reviewer/affiliate marketer) trực tiếp xuất hiện trong video là MỘT ÔNG BỐ trẻ tuổi. Dựa vào thông tin sản phẩm và Hook dưới đây, hãy thiết kế một kịch bản cảnh quay B-roll chi tiết (khoảng 5-7 cảnh quay) để ông bố dựng video hoàn chỉnh.

Lưu ý quan trọng về nhân vật: Toàn bộ mô tả hành động, góc máy phải hướng về **ông bố** (ví dụ: bố cầm sản phẩm, ông bố review, ông bố chia sẻ kinh nghiệm chăm con), tuyệt đối không dùng từ "mẹ" hay "bà mẹ".

Thông tin sản phẩm:
- Tên sản phẩm: ${product.name}
- Thông tin chi tiết: ${product.info}

Insight & Viral Hook được chọn làm gốc:
- Góc tiếp cận: ${targetInsight.angle}
- Câu Viral Hook mở đầu: "${targetInsight.viralHook}"
- Nỗi đau khách hàng: ${targetInsight.painPoint}
- Lợi ích sản phẩm: ${targetInsight.benefit}

Yêu cầu trả về đúng định dạng JSON chuẩn gồm một mảng (array) các đối tượng cảnh quay, mỗi đối tượng gồm:
- id: chuỗi định danh duy nhất (ví dụ: "shot_1", "shot_2"...)
- title: tên ngắn gọn của cảnh (VD: "Mở đầu gây chú ý", "Cận cảnh chi tiết", "Trải nghiệm thực tế"...)
- visualDescription: mô tả hình ảnh cảnh quay ông bố thực hiện chi tiết, sinh động
- cameraAngle: góc máy (VD: "Góc cận (Close-up)", "Góc rộng (Wide)", "POV góc nhìn người dùng", "Top-down từ trên xuống")
- duration: thời lượng dự kiến (VD: "3s", "4s", "5s")
- audioNote: ghi chú âm thanh / voiceover / nhạc nền cho cảnh đó (giọng đọc của nam/bố)`;

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
                title: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                cameraAngle: { type: Type.STRING },
                duration: { type: Type.STRING },
                audioNote: { type: Type.STRING },
              },
              required: ['id', 'title', 'visualDescription', 'cameraAngle', 'duration'],
            },
          },
        },
      });

      const textResult = response.text || '';
      if (!textResult) {
        throw new Error('AI không trả về kết quả.');
      }

      const rawShots = JSON.parse(textResult);
      const newShots: BRollShot[] = rawShots.map((item: any, idx: number) => ({
        id: item.id || `shot_${Date.now()}_${idx}`,
        title: item.title || `Cảnh ${idx + 1}`,
        visualDescription: item.visualDescription || '',
        cameraAngle: item.cameraAngle || 'Góc cận (Close-up)',
        duration: item.duration || '3s',
        audioNote: item.audioNote || '',
      }));

      onUpdateProduct({
        ...product,
        bRollShots: newShots,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Failed to generate B-roll shots:', err);
      setErrorMessage(err.message || 'Không thể tạo cảnh quay lúc này. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteShot = (id: string) => {
    const updated = shots.filter((s) => s.id !== id);
    onUpdateProduct({
      ...product,
      bRollShots: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddManualShot = () => {
    if (!manualForm.visualDescription.trim()) return;

    const newShot: BRollShot = {
      id: `shot_manual_${Date.now()}`,
      title: manualForm.title.trim() || `Cảnh ${shots.length + 1}`,
      visualDescription: manualForm.visualDescription.trim(),
      cameraAngle: manualForm.cameraAngle,
      duration: manualForm.duration.trim() || '3s',
      audioNote: manualForm.audioNote.trim(),
    };

    onUpdateProduct({
      ...product,
      bRollShots: [...shots, newShot],
      updatedAt: new Date().toISOString(),
    });

    setManualForm({ title: '', visualDescription: '', cameraAngle: 'Góc cận (Close-up)', duration: '3s', audioNote: '' });
    setShowAddManual(false);
  };

  const handleCopyShot = (shot: BRollShot, idx: number) => {
    const text = `🎬 Cảnh ${idx + 1}: [${shot.title}]\n- Góc máy: ${shot.cameraAngle} (${shot.duration})\n- Hình ảnh: ${shot.visualDescription}${shot.audioNote ? `\n- Âm thanh: ${shot.audioNote}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(shot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Header */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span>Cảnh Quay Đẹp Dựng Video</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 font-semibold">
                  {shots.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tư liệu B-roll, góc quay chi tiết & kịch bản visual</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden xl:inline">Thêm cảnh</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleGenerateShots}
            disabled={!hasInsights || isGenerating}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isGenerating
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse border border-rose-200'
                : hasInsights
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                <span>AI đang lên cảnh quay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Gợi ý Cảnh Quay AI</span>
              </>
            )}
          </button>

          <button
            onClick={onExportScript}
            disabled={shots.length === 0}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              shots.length > 0
                ? 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span>Xuất Kịch Bản Video</span>
          </button>
        </div>

        {!hasInsights && (
          <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 p-2 rounded-lg mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Cần có ít nhất 1 Insight ở Cột 3 để AI gợi ý chính xác cảnh quay.</span>
          </p>
        )}

        {errorMessage && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/80 border border-red-200 rounded-lg text-xs text-red-700 dark:text-red-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold text-[10px]">Đóng</button>
          </div>
        )}
      </div>

      {/* Manual Add Form */}
      {showAddManual && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Thêm cảnh quay thủ công</span>
            <button onClick={() => setShowAddManual(false)} className="cursor-pointer">✕</button>
          </div>
          <input
            type="text"
            placeholder="Tên cảnh (VD: Cận cảnh chi tiết sản phẩm)..."
            value={manualForm.title}
            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Góc máy (VD: Góc cận)"
              value={manualForm.cameraAngle}
              onChange={(e) => setManualForm({ ...manualForm, cameraAngle: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
            />
            <input
              type="text"
              placeholder="Thời lượng (VD: 3s)"
              value={manualForm.duration}
              onChange={(e) => setManualForm({ ...manualForm, duration: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Mô tả hình ảnh cảnh quay chi tiết... *"
            value={manualForm.visualDescription}
            onChange={(e) => setManualForm({ ...manualForm, visualDescription: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Ghi chú âm thanh / voiceover (tuỳ chọn)"
            value={manualForm.audioNote}
            onChange={(e) => setManualForm({ ...manualForm, audioNote: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowAddManual(false)} className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Hủy</button>
            <button onClick={handleAddManualShot} className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium">Lưu Cảnh Quay</button>
          </div>
        </div>
      )}

      {/* Shots List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {shots.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có cảnh quay tư liệu nào</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Hãy bấm "Gợi ý Cảnh Quay AI" hoặc ấn nút "Thêm cảnh" để lập danh sách các góc quay đắt giá làm tư liệu video triệu view!
            </p>
          </div>
        ) : (
          shots.map((shot, index) => {
            const isCopied = copiedId === shot.id;

            return (
              <div
                key={shot.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 transition-all hover:border-rose-300 relative group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300">
                      Cảnh #{index + 1}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-rose-500" />
                      {shot.cameraAngle}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {shot.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyShot(shot, index)}
                      className={`p-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                        isCopied ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title="Copy cảnh quay"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteShot(shot.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Xóa cảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {shot.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {shot.visualDescription}
                </p>

                {shot.audioNote && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 flex items-start gap-1">
                    <span className="font-semibold text-rose-600 shrink-0">🔊 Âm thanh:</span>
                    <span className="italic">{shot.audioNote}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between shrink-0">
        <span>Tiến độ: <strong className="text-slate-800 dark:text-slate-200">{shots.length}</strong> cảnh quay</span>
        {shots.length > 0 && (
          <button onClick={onExportScript} className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer">
            <span>Xem kịch bản video</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

    </div>
  );
};
