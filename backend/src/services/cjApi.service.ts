import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CJProduct } from '../types';
import { redisService } from './redis.service';
import { currencyService } from './currency.service';
import { cjAuthService } from './cjAuth.service';

const MOCK_BABY_PRODUCTS: CJProduct[] = [
  {
    pid: 'BABY001',
    productName: 'Organic Cotton Newborn Onesie Set (3-Pack)',
    productImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    sellPrice: 35.99,
    categoryId: 'clothes',
    categoryName: 'Baby Clothing',
    description: 'Soft, breathable organic cotton onesies perfect for sensitive newborn skin.',
    variants: [
      { vid: 'BABY001-V1', variantName: '0-3 Months', variantSellPrice: 35.99, stock: 150 },
      { vid: 'BABY001-V2', variantName: '3-6 Months', variantSellPrice: 35.99, stock: 120 },
    ]
  },
  {
    pid: 'BABY002',
    productName: 'Wooden Montessori Stacking Rings Toy',
    productImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800',
    sellPrice: 24.50,
    categoryId: 'toys',
    categoryName: 'Educational Toys',
    description: 'Classic wooden stacking toy painted with non-toxic, water-based pastel colors.',
    variants: [
      { vid: 'BABY002-V1', variantName: 'Standard', variantSellPrice: 24.50, stock: 85 },
    ]
  },
  {
    pid: 'BABY003',
    productName: 'Premium Ergonomic Baby Carrier',
    productImage: 'https://images.unsplash.com/photo-1544126592-807a22002061?w=800',
    sellPrice: 129.00,
    categoryId: 'essentials',
    categoryName: 'Gear & Travel',
    description: 'Comfortable carrier supporting healthy hip positioning for babies from 7-35 lbs.',
    variants: [
      { vid: 'BABY003-V1', variantName: 'Soft Blush', variantSellPrice: 129.00, stock: 40 },
      { vid: 'BABY003-V2', variantName: 'Sky Blue', variantSellPrice: 129.00, stock: 35 },
    ]
  },
  {
    pid: 'BABY004',
    productName: 'Organic Bamboo Baby Hooded Towel',
    productImage: 'https://images.unsplash.com/photo-1610996843657-3f8d22df2422?w=800',
    sellPrice: 28.00,
    categoryId: 'essentials',
    categoryName: 'Bath & Skincare',
    description: 'Ultra-soft and highly absorbent bamboo hooded towel with adorable bear ears.',
    variants: [
      { vid: 'BABY004-V1', variantName: 'Cream', variantSellPrice: 28.00, stock: 200 },
    ]
  }
];

class CjApiService {
  private baseUrl = env.CJ_API_BASE_URL;

  private async fetchApi<T>(endpoint: string, queryParamsOrBody: any, method = 'GET'): Promise<T> {
    const token = await cjAuthService.getAccessToken();
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    let options: RequestInit = {
      method,
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    if (method === 'GET') {
      Object.entries(queryParamsOrBody).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.append(k, String(v));
        }
      });
    } else {
      options.body = JSON.stringify(queryParamsOrBody);
    }

    const res = await fetch(url.toString(), options);
    const json = await res.json();
    if (!res.ok || !json.result) {
      throw new Error(json.message || 'CJ API Error');
    }
    return json.data;
  }

  async getProducts(page = 1, limit = 10, categoryId?: string): Promise<{ list: CJProduct[], total: number }> {
    const cacheKey = redisService.productListKey(page, limit, categoryId);
    const cached = await redisService.get<{ list: CJProduct[], total: number }>(cacheKey);
    
    if (cached) {
      logger.info('Products served from cache', { cacheKey });
      return cached;
    }

    if (env.CJ_MOCK_MODE) {
      let filtered = MOCK_BABY_PRODUCTS;
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(p => p.categoryId === categoryId);
      }
      const rate = await currencyService.getUsdToInrRate();
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit).map(p => ({
        ...p,
        sellPrice: p.sellPrice * rate,
        variants: p.variants?.map(v => ({ ...v, variantSellPrice: v.variantSellPrice * rate }))
      }));
      
      const result = { list: paginated, total: filtered.length };
      await redisService.set(cacheKey, result, redisService.getProductTtl());
      return result;
    }

    // Live fetching
    try {
      const isAll = !categoryId || categoryId === 'all';
      
      let searchKeyword = 'baby';
      if (categoryId === '1336151594957590528') searchKeyword = 'baby clothing';
      else if (categoryId === '1336151594957590529') searchKeyword = 'baby toy';
      else if (categoryId === '1336151594957590530') searchKeyword = 'baby care';

      const data = await this.fetchApi<any>('/product/listV2', {
        page: page,
        size: limit,
        keyWord: searchKeyword,
      });

      const rate = await currencyService.getUsdToInrRate();
      
      let rawList = [];
      if (data && data.content && data.content.length > 0 && data.content[0].productList) {
        rawList = data.content[0].productList;
      }
      
      const list = rawList.map((raw: any) => ({
        pid: raw.id,
        productName: raw.nameEn || raw.productName,
        productImage: raw.bigImage,
        sellPrice: Math.round((parseFloat(raw.sellPrice) || 0) * rate),
        categoryId: raw.categoryId,
        categoryName: raw.threeCategoryName || raw.categoryName || '',
      }));

      const totalRecords = data && data.totalRecords ? data.totalRecords : list.length;
      const result = { list, total: totalRecords };
      await redisService.set(cacheKey, result, redisService.getProductTtl());
      return result;
    } catch (err) {
      logger.error('CJ getProducts live fetching error', { error: err });
      throw err;
    }
  }

  async getProductDetail(pid: string): Promise<CJProduct | null> {
    const cacheKey = redisService.productDetailKey(pid);
    const cached = await redisService.get<CJProduct>(cacheKey);
    
    if (cached) {
      logger.info('Product detail served from cache', { cacheKey });
      return cached;
    }

    if (env.CJ_MOCK_MODE) {
      const product = MOCK_BABY_PRODUCTS.find(p => p.pid === pid);
      if (product) {
        const rate = await currencyService.getUsdToInrRate();
        const inrProduct = {
          ...product,
          sellPrice: product.sellPrice * rate,
          variants: product.variants?.map(v => ({ ...v, variantSellPrice: v.variantSellPrice * rate }))
        };
        await redisService.set(cacheKey, inrProduct, redisService.getProductTtl());
        return inrProduct;
      }
      return null;
    }

    // Live fetching
    try {
      const data = await this.fetchApi<any>('/product/query', { pid });
      if (!data) return null;

      const rate = await currencyService.getUsdToInrRate();
      const product: CJProduct = {
        pid: data.pid,
        productName: data.productNameEn || data.productName,
        productImage: data.productImage || (data.productImageSet ? (Array.isArray(data.productImageSet) ? data.productImageSet[0] : (data.productImageSet.startsWith('[') ? JSON.parse(data.productImageSet)[0] : data.productImageSet)) : ''),
        sellPrice: Math.round((parseFloat(data.sellPrice) || 0) * rate),
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        description: data.description,
        variants: (data.variants || []).map((v: any) => ({
          vid: v.vid,
          variantName: v.variantNameEn || v.variantName,
          variantSellPrice: Math.round((parseFloat(v.variantSellPrice) || 0) * rate),
          stock: v.inventoryNum || 99,
          variantSku: v.variantSku
        }))
      };

      await redisService.set(cacheKey, product, redisService.getProductTtl());
      return product;
    } catch (err) {
      logger.error('CJ getProductDetail live fetching error', { error: err });
      throw err;
    }
  }

  async createOrder(payload: any): Promise<{ orderId: string; orderNumber: string }> {
    if (env.CJ_MOCK_MODE) {
      logger.info('CJ mock order created', { orderNumber: payload.orderNumber });
      return {
        orderId: `CJ-MOCK-${Date.now()}`,
        orderNumber: payload.orderNumber,
      };
    }

    const orderBody = {
      isSandbox: 0,
      orderNumber: payload.orderNumber,
      shippingZip: payload.shippingZip,
      shippingCountryCode: payload.shippingCountryCode || 'DE',
      shippingCountry: payload.shippingCountry || 'Germany',
      shippingProvince: payload.shippingProvince || 'N/A',
      shippingCity: payload.shippingCity,
      shippingAddress: payload.shippingAddress,
      shippingCustomerName: payload.shippingCustomerName,
      shippingPhone: payload.shippingPhone,
      logisticName: 'CJ Packet',
      fromCountryCode: 'CN',
      platform: 'Api',
      orderFlow: 1,
      products: payload.products,
    };

    logger.info('CJ createOrder payload', orderBody);

    const data = await this.fetchApi<any>('/shopping/order/createOrderV2', orderBody, 'POST');
    return {
      orderId: data.orderId || `CJ-${Date.now()}`,
      orderNumber: data.orderNumber || payload.orderNumber,
    };
  }
}

export const cjApiService = new CjApiService();
