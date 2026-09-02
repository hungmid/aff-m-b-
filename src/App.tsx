import React, { useState, useEffect } from 'react';
import { 
  Product, 
  CategoryType, 
  SortOption, 
  CustomerInsight 
} from './types';
import { supabase } from './supabaseClient';
import { 
  loadProductsFromStorage, 
  saveProductsToStorage, 
  loadActiveProductId, 
  saveActiveProductId 
} from './utils/storage';
import { Header } from './components/Header';
import { ProductListColumn } from './components/ProductListColumn';
import { ProductInfoColumn } from './components/ProductInfoColumn';
import { CustomerInsightsColumn } from './components/CustomerInsightsColumn';
import { VideoShotsColumn } from './components/VideoShotsColumn';
import { ProductModal } from './components/ProductModal';
import { ScriptExportModal } from './components/ScriptExportModal';
import { BackupModal } from './components/BackupModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  // 1. Tải trước từ bộ nhớ cục bộ (localStorage) để hiển thị ngay lập tức
  const [products, setProducts] = useState<Product[]>(() => loadProductsFromStorage());
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const initialProds = loadProductsFromStorage();
    return loadActiveProductId(initialProds[0]?.id);
  });

  // 2. Đồng thời tải ngầm từ Supabase về để cập nhật dữ liệu mới nhất từ thiết bị khác
  useEffect(() => {
    const syncFromCloud = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        const cloudProducts: Product[] = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.title || '',
          category: item.category || 'mom-essentials',
          price: item.price || '',
          originalPrice: item.originalPrice || '',
          affiliateUrl: item.affiliate_link || '',
          commissionRate: item.commissionRate || '',
          imageUrl: item.image_url || '',
          info: item.info || '',
          targetAudience: item.targetAudience || '',
          highlights: item.highlights || [],
          notes: item.notes || '',
          insights: item.insights || [],
          shots: item.shots || [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        setProducts(cloudProducts);
      }
    };
    syncFromCloud();
  }, []);

  // 3. Tự động lưu cục bộ mỗi khi danh sách thay đổi
  useEffect(() => {
    saveProductsToStorage(products);
  }, [products]);

  useEffect(() => {
    if (activeProductId) {
      saveActiveProductId(activeProductId);
    }
  }, [activeProductId]);

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('time_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsightForShots, setSelectedInsightForShots] = useState<CustomerInsight | null>(null);

  // Theme & Font scale states...
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mom_baby_theme_v3');
      return (saved === 'dark' || saved === 'light') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('mom_baby_theme_v3', theme); } catch {}
  }, [theme]);

  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mom_baby_font_scale');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale}%`);
    try { localStorage.setItem('mom_baby_font_scale', fontScale.toString()); } catch {}
  }, [fontScale]);

  const [activeMobileColumn, setActiveMobileColumn] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'columns' | 'grid'>('columns');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isExportScriptModalOpen, setIsExportScriptModalOpen] = useState(false);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0] || null;

  const handleSelectProduct = (prod: Product) => {
    setActiveProductId(prod.id);
    setSelectedInsightForShots(prod.insights?.[0] || null);
    if (window.innerWidth < 1024) {
      setActiveMobileColumn(2);
    }
  };

  // Cập nhật sản phẩm: Lưu cục bộ + Đẩy lên Supabase
  const handleUpdateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await supabase.from('products').update({
      title: updated.name,
      price: updated.price,
      affiliate_link: updated.affiliateUrl,
      image_url: updated.imageUrl,
      notes: updated.notes,
    }).eq('id', updated.id);
  };

  // Thêm sản phẩm mới: Lưu cục bộ + Đẩy lên Supabase
  const handleAddProduct = async (productData: Partial<Product>) => {
    const newProductPayload = {
      title: productData.name || 'Sản phẩm mới',
      price: productData.price || '',
      affiliate_link: productData.affiliateUrl || '',
      image_url: productData.imageUrl || '',
      notes: productData.notes || '',
    };

    const { data, error } = await supabase.from('products').insert([newProductPayload]).select();

    const newProduct: Product = {
      id: data && data[0] ? data[0].id.toString() : `prod_${Date.now()}`,
      name: productData.name || 'Sản phẩm mới',
      category: productData.category || 'mom-essentials',
      price: productData.price || '',
      originalPrice: productData.originalPrice || '',
      affiliateUrl: productData.affiliateUrl || '',
      commissionRate: productData.commissionRate || '',
      imageUrl: productData.imageUrl || '',
      info: productData.info || '',
      targetAudience: productData.targetAudience || '',
      highlights: productData.highlights || [],
      notes: productData.notes || '',
      insights: [],
      shots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    setActiveProductId(newProduct.id);
    setSelectedInsightForShots(null);

    if (window.innerWidth < 1024) {
      setActiveMobileColumn(2);
    }
  };

  // Xóa sản phẩm: Xóa cục bộ + Xóa trên Supabase
  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeProductId === id) {
        setActiveProductId(next[0]?.id || null);
      }
      return next;
    });

    await supabase.from('products').delete().eq('id', id);
  };

  const handleDuplicateProduct = (prod: Product) => {
    handleAddProduct(prod);
  };

  const handleRestoreProducts = (restored: Product[]) => {
    setProducts(restored);
    if (restored.length > 0) {
      setActiveProductId(restored[0].id);
    }
  };

  const handleSelectInsightForShots = (insight: CustomerInsight) => {
    setSelectedInsightForShots(insight);
    if (window.innerWidth < 1024) {
      setActiveMobileColumn(4);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0B1120] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none transition-colors duration-200">
      <Header
        products={products}
        activeProduct={activeProduct}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'columns' ? 'grid' : 'columns')}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        onResetFontScale={() => setFontScale(100)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* Mobile Tabs */}
      <div className="xl:hidden bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-3 py-1.5 shrink-0 z-20">
        <div className="grid grid-cols-4 gap-1.5 max-w-lg mx-auto text-xs">
          <button onClick={() => setActiveMobileColumn(1)} className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 ${activeMobileColumn === 1 ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>
            <span>1</span> S.Phẩm
          </button>
          <button onClick={() => setActiveMobileColumn(2)} className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 ${activeMobileColumn === 2 ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>
            <span>2</span> Chi Tiết
          </button>
          <button onClick={() => setActiveMobileColumn(3)} className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 ${activeMobileColumn === 3 ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>
            <span>3</span> Insight
          </button>
          <button onClick={() => setActiveMobileColumn(4)} className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 ${activeMobileColumn === 4 ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>
            <span>4</span> Quay
          </button>
        </div>
      </div>

      <main className="flex-1 w-full p-2 sm:p-2.5 lg:p-3 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 h-full items-stretch overflow-y-auto xl:overflow-hidden">
          <div className={`${activeMobileColumn === 1 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <ProductListColumn
              products={products}
              activeProductId={activeProductId}
              onSelectProduct={handleSelectProduct}
              onAddProduct={() => setIsAddModalOpen(true)}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortOption={sortOption}
              onSortChange={setSortOption}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
          <div className={`${activeMobileColumn === 2 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <ProductInfoColumn
              product={activeProduct}
              onUpdateProduct={handleUpdateProduct}
              onGenerateInsightShortcut={() => setActiveMobileColumn(3)}
            />
          </div>
          <div className={`${activeMobileColumn === 3 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <CustomerInsightsColumn
              product={activeProduct}
              onUpdateProduct={handleUpdateProduct}
              onSelectInsightForShots={handleSelectInsightForShots}
            />
          </div>
          <div className={`${activeMobileColumn === 4 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <VideoShotsColumn
              product={activeProduct}
              onUpdateProduct={handleUpdateProduct}
              onOpenExportScriptModal={() => setIsExportScriptModalOpen(true)}
              selectedInsightForShots={selectedInsightForShots}
            />
          </div>
        </div>
      </main>

      <ProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddProduct} />
      <ScriptExportModal isOpen={isExportScriptModalOpen} onClose={() => setIsExportScriptModalOpen(false)} product={activeProduct} selectedInsight={selectedInsightForShots} />
      <BackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} products={products} onRestoreProducts={handleRestoreProducts} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}
