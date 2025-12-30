import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function addStock(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function adjustStock(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getStockEntries(req: AuthRequest, res: Response): Promise<void>;
export declare function getStockAdjustments(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=stock.controller.d.ts.map