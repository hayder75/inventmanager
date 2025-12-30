import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function getCashFlow(req: AuthRequest, res: Response): Promise<void>;
export declare function getCashFlowHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function setDailyOpeningBalance(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getDailyOpeningBalance(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getDailySales(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cashflow.controller.d.ts.map