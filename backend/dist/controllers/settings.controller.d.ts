import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function getSettings(req: AuthRequest, res: Response): Promise<void>;
export declare function updateSetting(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getSetting(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=settings.controller.d.ts.map