import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

const STORAGE_KEY = 'affiliate_mom_baby_products_v1';
const ACTIVE_PROD_KEY = 'affiliate_mom_baby_active_id';

export function loadProductsFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time - populate with initial sample data
      saveProductsToStorage(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch (error) {
    console.error('Failed to load products from localStorage:', error);
    return INITIAL_PRODUCTS;
  }
}

export function saveProductsToStorage(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save products to localStorage:', error);
  }
}

export function loadActiveProductId(fallbackId?: string): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROD_KEY) || fallbackId || null;
  } catch (e) {
    return fallbackId || null;
  }
}

export function saveActiveProductId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROD_KEY, id);
  } catch (e) {
    console.error('Failed to save active product id:', e);
  }
}

export function exportDataAsJSON(products: Product[]): void {
  try {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `affiliate-me-be-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export failed:', e);
  }
}

export function importDataFromJSON(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Định dạng file không đúng: Cần là mảng danh sách sản phẩm'));
        }
      } catch (err) {
        reject(new Error('File JSON không hợp lệ'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
    reader.readAsText(file);
  });
}
