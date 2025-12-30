import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createSale(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getSales(req: AuthRequest, res: Response): Promise<void>;
export declare function getSaleById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getBankDeposits(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=sales.controller.d.ts.map