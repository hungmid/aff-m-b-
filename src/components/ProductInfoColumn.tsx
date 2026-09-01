import React, { useState, useRef } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Upload, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertCircle,
  X,
  Image as ImageIcon,
  Video,
  Star
} from 'lucide-react';
import { Product, CategoryType, CATEGORIES } from '../types';
import { fileToBase64Compressed } from '../utils/imageUtils';

interface ProductInfoColumnProps {
  product: Product | null;
  onUpdateProduct: (updated: Product) => void;
  onGenerateInsightShortcut: () => void;
}

export const ProductInfoColumn: React.FC<ProductInfoColumnProps> = ({
  product,
  onUpdateProduct,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<{ url: string; index: number } | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!product) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-8 items-center justify-center text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa chọn sản phẩm</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Vui lòng chọn một sản phẩm từ danh sách bên trái hoặc ấn "Thêm sản phẩm" để xem và chỉnh sửa thông tin chi tiết.
        </p>
      </div>
    );
  }

  const currentImages: string[] = product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const handleChange = (field: keyof Product, value: any) => {
    onUpdateProduct({
      ...product,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const availableSlots = 5 - currentImages.length;
    if (availableSlots <= 0) {
      alert('Đã đạt tối đa 5 ảnh cho sản phẩm này.');
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

      if (base64List.length > 0) {
        const updatedImages = [...currentImages, ...base64List].slice(0, 5);
        onUpdateProduct({
          ...product,
          images: updatedImages,
          imageUrl: updatedImages[0] || '',
          updatedAt: new Date().toISOString(),
        });
      }
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
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    onUpdateProduct({
      ...product,
      images: updatedImages,
      imageUrl: updatedImages[0] || '',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = currentImages[index];
    const rest = currentImages.filter((_, idx) => idx !== index);
    const updatedImages = [target, ...rest];
    onUpdateProduct({
      ...product,
      images: updatedImages,
      imageUrl: target,
      updatedAt: new Date().toISOString(),
    });
  };

  const hasEnoughInfoForInsights = Boolean(
    product.name?.trim() && product.info?.trim() && product.info.trim().length >= 10
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Header */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs dark:border-rose-800/70">
            2
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-['Quicksand']">
              <span>Thông Tin Chi Tiết Sản Phẩm</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tư liệu đầu vào để AI đào sâu insight & kịch bản</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 text-[11px] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Tự động lưu F5</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 min-h-0">
        
        {/* Product Name */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tên sản phẩm <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-product-name"
            type="text"
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ví dụ: Máy hút sữa điện đôi rảnh tay không dây cao cấp..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 transition-all shadow-2xs"
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Hạng mục ngành hàng <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-product-category"
              value={product.category}
              onChange={(e) => handleChange('category', e.target.value as CategoryType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 transition-all shadow-2xs"
            >
              {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => (
                <option key={catKey} value={catKey} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {CATEGORIES[catKey].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Giá bán hiện tại (Flash sale / Giá bán)
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                id="input-product-price"
                type="text"
                value={product.price || ''}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="VD: 185.000đ"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* AFFILIATE SECTION: SHOPEE & TIKTOK SHOP */}
        <div className="space-y-3 pt-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Link Tiếp Thị & Tỷ Lệ Hoa Hồng (Shopee & TikTok Shop)
          </div>

          {/* Shopee Block */}
          <div className="p-3 bg-orange-50/50 dark:bg-orange-950/30 rounded-xl border border-orange-200/80 dark:border-orange-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300">
                <div className="w-5 h-5 rounded-md bg-[#EE4D2D] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  S
                </div>
                <span>Shopee Affiliate</span>
              </div>
              <span className="text-[10px] text-orange-700 dark:text-orange-400 font-medium">Link tiếp thị chính</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8 flex items-center gap-1.5">
                <input
                  id="input-shopee-url"
                  type="url"
                  value={product.shopeeUrl || product.affiliateUrl || ''}
                  onChange={(e) => {
                    handleChange('shopeeUrl', e.target.value);
                    if (!product.affiliateUrl) {
                      handleChange('affiliateUrl', e.target.value);
                    }
                  }}
                  placeholder="https://shopee.vn/affiliate-link-cua-ban..."
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/70 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-300/60 font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = product.shopeeUrl || product.affiliateUrl;
                    if (url) {
                      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!product.shopeeUrl && !product.affiliateUrl}
                  title="Mở link Shopee trong tab mới"
                  className="px-2.5 py-1.5 bg-[#EE4D2D] hover:bg-[#d83c1d] disabled:opacity-40 disabled:hover:bg-[#EE4D2D] disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở link</span>
                </button>
              </div>

              <div className="sm:col-span-4 relative">
                <Percent className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                <input
                  id="input-shopee-commission"
                  type="text"
                  value={product.shopeeCommission || product.commissionRate || ''}
                  onChange={(e) => {
                    handleChange('shopeeCommission', e.target.value);
                    if (!product.commissionRate) {
                      handleChange('commissionRate', e.target.value);
                    }
                  }}
                  placeholder="Hoa hồng: 12%, 30k"
                  className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-slate-950 border border-orange-200 dark:border-orange-900/70 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-300/60 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* TikTok Shop Block */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] shadow-xs border border-slate-700">
                  <Video className="w-3 h-3 text-cyan-400 fill-rose-500" />
                </div>
                <span>TikTok Shop Affiliate</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Link video / Showcase</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8 flex items-center gap-1.5">
                <input
                  id="input-tiktok-url"
                  type="url"
                  value={product.tiktokUrl || ''}
                  onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                  placeholder="https://vt.tiktok.com/... hoặc link showcase"
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (product.tiktokUrl) {
                      const finalUrl = product.tiktokUrl.startsWith('http') ? product.tiktokUrl : `https://${product.tiktokUrl}`;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!product.tiktokUrl}
                  title="Mở link TikTok Shop trong tab mới"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở link</span>
                </button>
              </div>

              <div className="sm:col-span-4 relative">
                <Percent className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-tiktok-commission"
                  type="text"
                  value={product.tiktokCommission || ''}
                  onChange={(e) => handleChange('tiktokCommission', e.target.value)}
                  placeholder="Hoa hồng: 18%, 50k"
                  className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD & HOVER ZOOM SECTION (MAX 5 IMAGES, LOCAL PERSISTENCE) */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Ảnh sản phẩm thực tế (Tối đa 5 ảnh)</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Rê chuột để phóng to xem rõ • Tự động lưu trên máy
              </p>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentImages.length >= 5 
                ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/70' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/70'
            }`}>
              {currentImages.length}/5 ảnh
            </span>

          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageFiles(e.target.files)}
          />

          {/* Thumbnails grid with Hover Zoom */}
          {currentImages.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {currentImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-visible aspect-square"
                  onMouseEnter={() => setHoveredImage({ url: imgUrl, index: idx })}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <div
                    onClick={() => setPreviewModalUrl(imgUrl)}
                    className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group-hover:border-rose-400 group-hover:shadow-xs transition-all cursor-zoom-in relative"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Badge Ảnh chính on 1st image */}
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs flex items-center gap-0.5 pointer-events-none z-10">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Chính</span>
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 text-[9px] font-bold bg-slate-900/80 text-white px-1 rounded pointer-events-none z-10 border border-slate-800">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Actions overlay on thumbnail */}
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      title="Đặt làm ảnh chính đại diện"
                      className="absolute top-1 left-1 bg-slate-900/90 hover:bg-rose-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 shadow-xs border border-slate-700"
                    >
                      Đặt chính
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                      if (hoveredImage?.index === idx) setHoveredImage(null);
                    }}
                    title="Xóa ảnh này"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer shadow-xs z-20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add slot if < 5 */}
              {currentImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/50 dark:bg-slate-900/50 dark:hover:bg-rose-950/30 flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 transition-all cursor-pointer shadow-2xs group"
                >
                  <Upload className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-[10px] font-bold">+ Thêm</span>
                </button>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleImageFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-rose-400 hover:bg-rose-50/40 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/70 flex items-center justify-center mb-1.5">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isUploading ? 'Đang xử lý ảnh...' : 'Nhấp để tải ảnh lên hoặc kéo thả vào đây'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hỗ trợ tải tối đa 5 ảnh (JPG, PNG, WebP) • Tự động lưu trên máy
              </p>
            </div>
          )}

          {/* Floating Enlarged Zoom Popover when hovering */}
          {hoveredImage && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                <div className="w-64 h-64 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative shadow-inner">
                  <img
                    src={hoveredImage.url}
                    alt={`Phóng to ảnh ${hoveredImage.index + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1 border border-slate-800">
                    <span>Ảnh #{hoveredImage.index + 1}</span>
                    {hoveredImage.index === 0 && <span className="text-rose-400 font-bold">• Ảnh chính</span>}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <span>🔍 Nhấp chuột vào ảnh để xem toàn màn hình</span>
                </div>
              </div>
              {/* Arrow */}
              <div className="w-3 h-3 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45 mx-auto -mt-1.5"></div>
            </div>
          )}
        </div>

        {/* Fullscreen Modal Lightbox if clicked */}
        {previewModalUrl && (
          <div
            onClick={() => setPreviewModalUrl(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          >
            <div className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewModalUrl}
                alt="Chi tiết ảnh phóng to"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-200 hover:text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-lg border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* MAIN PRODUCT INFO TEXTAREA */}
        <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-900/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Thông tin, công dụng & đặc điểm sản phẩm</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">
              {product.info?.length || 0} ký tự
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
            Điền càng chi tiết về chất liệu, tính năng, công dụng thực tế, ưu điểm vượt trội và giải pháp mang lại, AI sẽ phân tích insight & câu hook càng sắc bén!
          </p>

          <textarea
            id="textarea-product-info"
            rows={6}
            value={product.info || ''}
            onChange={(e) => handleChange('info', e.target.value)}
            placeholder="Ví dụ:&#10;- Chất liệu: Silicon y tế an toàn, không chứa BPA...&#10;- Công dụng: Giúp mẹ hút sữa rảnh tay không dây, độ ồn cực thấp dưới 40dB không làm bé thức giấc...&#10;- Chế độ: 3 chế độ massage kích sữa và hút sâu...&#10;- Tiện ích: Vừa hút vừa nấu cơm, dọn dẹp..."
            className="w-full p-3 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/70 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-300/60 transition-all leading-relaxed shadow-2xs"
          />

          {!hasEnoughInfoForInsights && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 px-2.5 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Hãy điền thêm thông tin để mở khóa nút "Tạo Insight AI" ở Cột 3.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
