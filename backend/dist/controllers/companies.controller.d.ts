import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getCompanies(req: AuthRequest, res: Response): Promise<void>;
export declare function getCompanyById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteCompany(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=companies.controller.d.ts.map