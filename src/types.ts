export type CategoryType = 
  | 'mom-essentials'
  | 'baby-care'
  | 'baby-clothes'
  | 'baby-toys'
  | 'utility-items'; // <-- Thêm danh mục Đồ dùng tiện ích ở đây

export interface CategoryMeta {
  id: CategoryType;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
}

export const CATEGORIES: Record<CategoryType, CategoryMeta> = {
  'mom-essentials': {
    id: 'mom-essentials',
    name: 'Đồ dùng cho mẹ',
    shortName: 'Cho Mẹ',
    iconName: 'HeartHandshake',
    color: 'rose',
    bgColor: 'bg-rose-50/70 dark:bg-rose-950/30',
    borderColor: 'border-rose-200/80 dark:border-rose-900/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    description: 'Máy hút sữa, đai nịt bụng, vitamin bầu, gối chữ U, váy bầu...',
  },
  'baby-care': {
    id: 'baby-care',
    name: 'Đồ vệ sinh chăm sóc cho bé',
    shortName: 'Vệ sinh & Chăm sóc',
    iconName: 'Sparkles',
    color: 'sky',
    bgColor: 'bg-sky-50/70 dark:bg-sky-950/30',
    borderColor: 'border-sky-200/80 dark:border-sky-900/50',
    textColor: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    description: 'Tã bỉm, nước rửa bình, kem hăm, sữa tắm gội, máy hâm sữa...',
  },
  'baby-clothes': {
    id: 'baby-clothes',
    name: 'Quần áo phụ kiện cho bé',
    shortName: 'Quần áo & Phụ kiện',
    iconName: 'Shirt',
    color: 'amber',
    bgColor: 'bg-amber-50/70 dark:bg-amber-950/30',
    borderColor: 'border-amber-200/80 dark:border-amber-900/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    description: 'Bộ tăm tre, bao tay chân, mũ sơ sinh, yếm ăn dặm, giày tập đi...',
  },
  'baby-toys': {
    id: 'baby-toys',
    name: 'Đồ chơi - phát triển cho bé',
    shortName: 'Đồ chơi & Phát triển',
    iconName: 'Gamepad2',
    color: 'emerald',
    bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200/80 dark:border-emerald-900/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    description: 'Gặm nướu silicon, xúc xắc, sách vải kích thích thị giác, xe tập đi...',
  },
  'utility-items': {
    id: 'utility-items',
    name: 'Đồ dùng tiện ích',
    shortName: 'Tiện ích',
    iconName: 'Wrench',
    color: 'indigo',
    bgColor: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200/80 dark:border-indigo-900/50',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    description: 'Các thiết bị, vật dụng thông minh và tiện ích hỗ trợ sinh hoạt...',
  },
};

export interface CustomerInsight {
  id: string;
  angle: string;
  painPoint: string;
  benefit: string;
  viralHook: string;
  scriptIdea?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface VideoShot {
  id: string;
  title: string;
  description: string;
  shotType: string;
  durationSeconds: number;
  onScreenText: string;
  propOrNote?: string;
  status: 'pending' | 'filmed';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price?: string; 
  
  shopeeUrl?: string;
  shopeeCommission?: string;
  
  tiktokUrl?: string;
  tiktokCommission?: string;
  
  images?: string[];

  imageUrl?: string;
  affiliateUrl?: string;
  commissionRate?: string;
  originalPrice?: string;
  targetAudience?: string;

  info: string;
  highlights?: string[];
  notes?: string;
  insights: CustomerInsight[];
  shots: VideoShot[];
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'name_asc' | 'name_desc' | 'time_desc' | 'time_asc';
