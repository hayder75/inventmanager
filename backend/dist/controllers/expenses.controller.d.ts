import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createExpense(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getExpenses(req: AuthRequest, res: Response): Promise<void>;
export declare function getExpenseReports(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getExpenseById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateExpense(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteExpense(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=expenses.controller.d.ts.map