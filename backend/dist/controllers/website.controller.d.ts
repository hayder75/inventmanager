import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare function getPublicProducts(req: any, res: Response): Promise<void>;
export declare function getNewProducts(req: any, res: Response): Promise<void>;
export declare function getAllPublicProducts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateProductWebsiteSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function toggleProductVisibility(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function toggleProductNewStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteProductImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=website.controller.d.ts.map