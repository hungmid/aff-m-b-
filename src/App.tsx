import React, { useState, useEffect } from 'react';
import { 
  Product, 
  CategoryType, 
  SortOption, 
  CustomerInsight 
} from './types';
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
import { 
  Layers, 
  FileText, 
  Lightbulb, 
  Clapperboard, 
  ChevronRight, 
  Plus, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadProductsFromStorage());
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const initialProds = loadProductsFromStorage();
    return loadActiveProductId(initialProds[0]?.id);
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('time_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsightForShots, setSelectedInsightForShots] = useState<CustomerInsight | null>(null);

  // Soothing Eye-Friendly Dark Theme by default
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mom_baby_theme_v3');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      return 'dark';
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
    try {
      localStorage.setItem('mom_baby_theme_v3', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Font size scale controller (85% - 140%)
  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mom_baby_font_scale');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  // Apply font scale to root document
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale}%`);
    try {
      localStorage.setItem('mom_baby_font_scale', fontScale.toString());
    } catch {
      // ignore
    }
  }, [fontScale]);

  // Responsive mobile tab view (1: List, 2: Info, 3: Insights, 4: Shots)
  const [activeMobileColumn, setActiveMobileColumn] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'columns' | 'grid'>('columns');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isExportScriptModalOpen, setIsExportScriptModalOpen] = useState(false);

  // Auto persist whenever products change
  useEffect(() => {
    saveProductsToStorage(products);
  }, [products]);

  // Persist active product ID
  useEffect(() => {
    if (activeProductId) {
      saveActiveProductId(activeProductId);
    }
  }, [activeProductId]);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0] || null;

  const handleSelectProduct = (prod: Product) => {
    setActiveProductId(prod.id);
    setSelectedInsightForShots(prod.insights?.[0] || null);
    // On small screens, move to info column
    if (window.innerWidth < 1024) {
      setActiveMobileColumn(2);
    }
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleAddProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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

    // On mobile, switch to column 2 to fill info
    if (window.innerWidth < 1024) {
      setActiveMobileColumn(2);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeProductId === id) {
        setActiveProductId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleDuplicateProduct = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${prod.name} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicated, ...prev]);
    setActiveProductId(duplicated.id);
  };

  const handleRestoreProducts = (restored: Product[]) => {
    setProducts(restored);
    if (restored.length > 0) {
      setActiveProductId(restored[0].id);
    }
  };

  const handleSelectInsightForShots = (insight: CustomerInsight) => {
    setSelectedInsightForShots(insight);
    // Switch to shots column on mobile
    if (window.innerWidth < 1024) {
      setActiveMobileColumn(4);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0B1120] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none transition-colors duration-200">
      
      {/* App Header */}
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

      {/* Mobile/Tablet Column Switcher Tabs */}
      <div className="xl:hidden bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-3 py-1.5 shrink-0 z-20">
        <div className="grid grid-cols-4 gap-1.5 max-w-lg mx-auto text-xs">
          <button
            onClick={() => setActiveMobileColumn(1)}
            className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeMobileColumn === 1
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Danh Sách</span>
            <span className="sm:hidden">Sản phẩm</span>
          </button>

          <button
            onClick={() => setActiveMobileColumn(2)}
            className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeMobileColumn === 2
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Thông Tin</span>
            <span className="sm:hidden">Chi tiết</span>
          </button>

          <button
            onClick={() => setActiveMobileColumn(3)}
            className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeMobileColumn === 3
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">Insight AI</span>
            <span className="sm:hidden">Hook AI</span>
          </button>

          <button
            onClick={() => setActiveMobileColumn(4)}
            className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeMobileColumn === 4
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
            <span className="hidden sm:inline">Cảnh Quay</span>
            <span className="sm:hidden">B-roll</span>
          </button>
        </div>
      </div>

      {/* Main 4-Column Workspace Layout - Fullscreen 16:9 Responsive Grid */}
      <main className="flex-1 w-full p-2 sm:p-2.5 lg:p-3 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 h-full items-stretch overflow-y-auto xl:overflow-hidden">
          
          {/* COLUMN 1: Danh sách sản phẩm */}
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

          {/* COLUMN 2: Thông tin về sản phẩm */}
          <div className={`${activeMobileColumn === 2 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <ProductInfoColumn
              product={activeProduct}
              onUpdateProduct={handleUpdateProduct}
              onGenerateInsightShortcut={() => {
                setActiveMobileColumn(3);
              }}
            />
          </div>

          {/* COLUMN 3: Insight khách hàng - Kèm câu Viral Hook */}
          <div className={`${activeMobileColumn === 3 ? 'block' : 'hidden xl:block'} h-full min-h-[500px] xl:min-h-0`}>
            <CustomerInsightsColumn
              product={activeProduct}
              onUpdateProduct={handleUpdateProduct}
              onSelectInsightForShots={handleSelectInsightForShots}
            />
          </div>

          {/* COLUMN 4: Cảnh quay đẹp tư liệu dựng video */}
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

      {/* Modals */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
      />

      <ScriptExportModal
        isOpen={isExportScriptModalOpen}
        onClose={() => setIsExportScriptModalOpen(false)}
        product={activeProduct}
        selectedInsight={selectedInsightForShots}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        products={products}
        onRestoreProducts={handleRestoreProducts}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

    </div>
  );
}
