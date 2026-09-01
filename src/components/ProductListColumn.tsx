import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Clock, 
  HeartHandshake, 
  Sparkles, 
  Shirt, 
  Gamepad2, 
  Layers,
  ChevronRight,
  Trash2,
  Copy,
  Lightbulb,
  Clapperboard,
  ExternalLink,
  Tag,
  Package
} from 'lucide-react';
import { Product, CategoryType, CATEGORIES, SortOption } from '../types';

interface ProductListColumnProps {
  products: Product[];
  activeProductId: string | null;
  onSelectProduct: (product: Product) => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDuplicateProduct: (product: Product) => void;
  selectedCategory: CategoryType | 'all';
  onSelectCategory: (cat: CategoryType | 'all') => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const ProductListColumn: React.FC<ProductListColumnProps> = ({
  products,
  activeProductId,
  onSelectProduct,
  onAddProduct,
  onDeleteProduct,
  onDuplicateProduct,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  searchTerm,
  onSearchChange,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter by category and search
  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm.trim() === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.info && item.info.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'name_asc') {
      return a.name.localeCompare(b.name, 'vi');
    }
    if (sortOption === 'name_desc') {
      return b.name.localeCompare(a.name, 'vi');
    }
    if (sortOption === 'time_desc') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortOption === 'time_asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    return 0;
  });

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'mom-essentials':
        return <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />;
      case 'baby-care':
        return <Sparkles className="w-3.5 h-3.5 text-sky-500" />;
      case 'baby-clothes':
        return <Shirt className="w-3.5 h-3.5 text-amber-500" />;
      case 'baby-toys':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: CategoryType) => {
    const meta = CATEGORIES[category];
    return meta ? meta.badgeBg : 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Column Header */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center font-bold text-xs dark:border-rose-800/70">
            1
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-['Quicksand']">
              <span>Danh Sách Sản Phẩm</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/70">
                {products.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Phân loại theo 4 hạng mục Mẹ & Bé</p>
          </div>
        </div>

        <button
          id="btn-quick-add-product"
          onClick={onAddProduct}
          className="p-1.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-lg transition-all shadow-xs flex items-center gap-1 text-xs font-medium cursor-pointer"
          title="Thêm sản phẩm mới"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 shrink-0">
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 px-1">
          Hạng mục ngành hàng:
        </div>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
          <button
            id="tab-cat-all"
            onClick={() => onSelectCategory('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200 shadow-2xs dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>Tất cả sản phẩm</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/80 dark:text-rose-200 dark:border-rose-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {products.length}
            </span>
          </button>

          {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;
            const count = products.filter((p) => p.category === catKey).length;
            return (
              <button
                key={catKey}
                id={`tab-cat-${catKey}`}
                onClick={() => onSelectCategory(catKey)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? `bg-rose-50 text-rose-800 font-bold border border-rose-200 shadow-2xs dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {getCategoryIcon(catKey)}
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${isSelected ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/80 dark:text-rose-200 dark:border-rose-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
          <input
            id="input-search-products"
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400 transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center justify-between gap-1 text-xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">Sắp xếp:</span>
          <div className="flex items-center gap-1 overflow-x-auto w-full justify-end">
            <button
              id="sort-name-asc"
              onClick={() => onSortChange(sortOption === 'name_asc' ? 'name_desc' : 'name_asc')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                sortOption === 'name_asc' || sortOption === 'name_desc'
                  ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
              title="Sắp xếp theo tên A-Z hoặc Z-A"
            >
              {sortOption === 'name_desc' ? <ArrowDownAZ className="w-3 h-3" /> : <ArrowUpAZ className="w-3 h-3" />}
              <span>{sortOption === 'name_desc' ? 'Tên Z-A' : 'Tên A-Z'}</span>
            </button>

            <button
              id="sort-time"
              onClick={() => onSortChange(sortOption === 'time_desc' ? 'time_asc' : 'time_desc')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                sortOption === 'time_desc' || sortOption === 'time_asc'
                  ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
              title="Sắp xếp theo thời gian thêm"
            >
              <Clock className="w-3 h-3" />
              <span>{sortOption === 'time_desc' ? 'Mới nhất' : 'Cũ nhất'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product List Items */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
        {sortedProducts.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Chưa có sản phẩm nào</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Hãy ấn nút Thêm sản phẩm để bắt đầu'}
            </p>
            <button
              onClick={onAddProduct}
              className="mt-3 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg shadow-xs transition-all cursor-pointer"
            >
              + Thêm sản phẩm ngay
            </button>
          </div>
        ) : (
          sortedProducts.map((prod) => {
            const isSelected = prod.id === activeProductId;
            const categoryMeta = CATEGORIES[prod.category] || CATEGORIES['mom-essentials'];
            const insightCount = prod.insights?.length || 0;
            const shotCount = prod.shots?.length || 0;

            return (
              <div
                key={prod.id}
                id={`product-card-${prod.id}`}
                onClick={() => onSelectProduct(prod)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50/70 dark:bg-slate-800 border-rose-400 dark:border-rose-500 shadow-sm border-l-4 border-l-rose-500'
                    : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                }`}
              >
                <div className="flex gap-2.5">
                  {/* Thumbnail / Category Icon */}
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden relative flex items-center justify-center">
                    {(prod.images && prod.images.length > 0) || prod.imageUrl ? (
                      <img
                        src={(prod.images && prod.images[0]) || prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-slate-400">
                        {getCategoryIcon(prod.category)}
                      </div>
                    )}
                    {prod.images && prod.images.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-slate-900/90 text-white text-[8px] font-bold px-1 rounded-tl border-t border-l border-slate-700">
                        {prod.images.length}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(prod.category)}`}>
                        {categoryMeta.shortName}
                      </span>
                      {prod.shopeeCommission && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200/80 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-800/80">
                          Shopee: {prod.shopeeCommission}
                        </span>
                      )}
                      {prod.tiktokCommission && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:border-slate-700">
                          TT: {prod.tiktokCommission}
                        </span>
                      )}
                      {!prod.shopeeCommission && !prod.tiktokCommission && prod.commissionRate && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80">
                          HH: {prod.commissionRate}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {prod.name}
                    </h3>

                    {prod.price && (
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {prod.price}
                      </div>
                    )}

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                      <span className={`flex items-center gap-1 font-medium ${insightCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-slate-400'}`}>
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>{insightCount} insights</span>
                      </span>

                      <span className={`flex items-center gap-1 font-medium ${shotCount > 0 ? 'text-sky-700 dark:text-sky-300' : 'text-slate-400 dark:text-slate-400'}`}>
                        <Clapperboard className="w-3 h-3 text-sky-500" />
                        <span>{shotCount} cảnh quay</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick actions on hover */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400">
                    {new Date(prod.createdAt).toLocaleDateString('vi-VN')}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProduct(prod);
                      }}
                      title="Nhân bản sản phẩm này"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === prod.id ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/80 p-0.5 rounded border border-red-200 dark:border-red-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProduct(prod.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-500 cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(prod.id);
                        }}
                        title="Xóa sản phẩm"
                        className="p-1 text-slate-400 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count summary */}
      <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shrink-0">
        Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedProducts.length}</span> / {products.length} sản phẩm
      </div>
    </div>
  );
};
