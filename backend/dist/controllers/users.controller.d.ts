import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUsers(req: AuthRequest, res: Response): Promise<void>;
export declare function getUserById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function resetUserPassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function resetUserCommission(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=users.controller.d.ts.map