import { Request, Response } from 'express';
import { cjApiService } from '../services/cjApi.service';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const categoryId = req.query.categoryId as string | undefined;

    const data = await cjApiService.getProducts(page, limit, categoryId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await cjApiService.getProductDetail(id as string);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product detail' });
  }
};
