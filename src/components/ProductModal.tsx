import React, { useState, useRef } from 'react';
import { X, Plus, Package, Sparkles, Upload, Percent, Star, Image as ImageIcon, DollarSign, ExternalLink } from 'lucide-react';
import { Product, CategoryType, CATEGORIES } from '../types';
import { fileToBase64Compressed } from '../utils/imageUtils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<CategoryType>(initialData?.category || 'mom-essentials');
  const [price, setPrice] = useState(initialData?.price || '');
  const [shopeeUrl, setShopeeUrl] = useState(initialData?.shopeeUrl || initialData?.affiliateUrl || '');
  const [shopeeCommission, setShopeeCommission] = useState(initialData?.shopeeCommission || initialData?.commissionRate || '');
  const [tiktokUrl, setTiktokUrl] = useState(initialData?.tiktokUrl || '');
  const [tiktokCommission, setTiktokCommission] = useState(initialData?.tiktokCommission || '');
  const [images, setImages] = useState<string[]>(initialData?.images || (initialData?.imageUrl ? [initialData.imageUrl] : []));
  const [info, setInfo] = useState(initialData?.info || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const availableSlots = 5 - images.length;
    if (availableSlots <= 0) {
      alert('Tối đa 5 ảnh cho mỗi sản phẩm.');
      return;
    }

    setIsUploading(true);
    try {
      const filesToProcess = Array.from(files).slice(0, availableSlots);
      const base64List: string[] = [];

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await fileToBase64Compressed(file, 1000, 1000, 0.85);
        base64List.push(base64);
      }

      setImages((prev) => [...prev, ...base64List].slice(0, 5));
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      price: price.trim(),
      shopeeUrl: shopeeUrl.trim(),
      shopeeCommission: shopeeCommission.trim(),
      tiktokUrl: tiktokUrl.trim(),
      tiktokCommission: tiktokCommission.trim(),
      images,
      imageUrl: images[0] || '',
      affiliateUrl: shopeeUrl.trim() || tiktokUrl.trim(),
      commissionRate: shopeeCommission.trim() || tiktokCommission.trim(),
      info: info.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-['Quicksand']">
                {initialData ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý sản phẩm Affiliate Mẹ & Bé</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Tên sản phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Máy hút sữa không dây, Nước rửa bình hữu cơ..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all shadow-2xs"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Hạng mục <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all shadow-2xs"
              >
                {(Object.keys(CATEGORIES) as CategoryType[]).map((k) => (
                  <option key={k} value={k} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {CATEGORIES[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Giá bán hiện tại
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 185.000đ"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Shopee Link & Commission */}
          <div className="p-3 bg-orange-50/70 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                <span className="w-4 h-4 rounded bg-[#EE4D2D] text-white flex items-center justify-center text-[9px] font-black">S</span>
                <span>Shopee Affiliate</span>
              </div>
              <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 font-medium">Link tiếp thị Shopee</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8 flex items-center gap-1.5">
                <input
                  type="url"
                  value={shopeeUrl}
                  onChange={(e) => setShopeeUrl(e.target.value)}
                  placeholder="Link Shopee..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/60 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (shopeeUrl) {
                      const finalUrl = shopeeUrl.startsWith('http') ? shopeeUrl : `https://${shopeeUrl}`;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!shopeeUrl}
                  title="Mở link Shopee"
                  className="px-2.5 py-1.5 bg-[#EE4D2D] hover:bg-[#d83c1d] disabled:opacity-40 disabled:hover:bg-[#EE4D2D] disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở</span>
                </button>
              </div>
              <div className="sm:col-span-4 relative">
                <Percent className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                <input
                  type="text"
                  value={shopeeCommission}
                  onChange={(e) => setShopeeCommission(e.target.value)}
                  placeholder="HH: 12%"
                  className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/60 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* TikTok Shop Link & Commission */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="w-4 h-4 rounded bg-slate-800 text-white flex items-center justify-center text-[9px] font-black border border-slate-700">TT</span>
                <span>TikTok Shop Affiliate</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Link video / Showcase</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8 flex items-center gap-1.5">
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="Link TikTok Shop..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tiktokUrl) {
                      const finalUrl = tiktokUrl.startsWith('http') ? tiktokUrl : `https://${tiktokUrl}`;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!tiktokUrl}
                  title="Mở link TikTok Shop"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer active:scale-95 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở</span>
                </button>
              </div>
              <div className="sm:col-span-4 relative">
                <Percent className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tiktokCommission}
                  onChange={(e) => setTiktokCommission(e.target.value)}
                  placeholder="HH: 18%"
                  className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Upload ảnh (tối đa 5 ảnh) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Tải ảnh lên (Tối đa 5 ảnh)</span>
              </label>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {images.length}/5 ảnh
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />

            {images.length > 0 ? (
              <div className="grid grid-cols-5 gap-1.5">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-300" />
                    {idx === 0 && (
                      <span className="absolute top-0.5 left-0.5 bg-rose-500 text-white text-[8px] font-bold px-1 rounded shadow-2xs pointer-events-none">Chính</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-400 bg-white/70 dark:bg-slate-900/50 flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold">+</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-400 rounded-lg text-center cursor-pointer bg-white/60 dark:bg-slate-900/50"
              >
                <Upload className="w-4 h-4 mx-auto text-rose-500 dark:text-rose-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tải ảnh sản phẩm lên máy</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Tối đa 5 ảnh • Tự động lưu</p>
              </div>
            )}
          </div>

          {/* Detailed Info */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Thông tin chi tiết, công dụng & đặc điểm sản phẩm
            </label>
            <textarea
              rows={3}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Mô tả các tính năng, công dụng, chất liệu, sự tiện ích giải phóng mẹ bỉm..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 leading-relaxed shadow-2xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Sách'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

