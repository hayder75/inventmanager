import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function getProducts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getProductById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateProduct(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteProduct(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getCategories(req: AuthRequest, res: Response): Promise<void>;
export declare function getProductMetrics(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=products.controller.d.ts.map