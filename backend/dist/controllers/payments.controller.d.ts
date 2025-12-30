import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function receivePayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getPayments(req: AuthRequest, res: Response): Promise<void>;
export declare function getCompaniesWithBalance(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=payments.controller.d.ts.map