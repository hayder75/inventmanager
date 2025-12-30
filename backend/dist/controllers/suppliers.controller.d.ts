import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function getSuppliersOwed(req: AuthRequest, res: Response): Promise<void>;
export declare function recordSupplierPayment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getSupplierPayments(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=suppliers.controller.d.ts.map