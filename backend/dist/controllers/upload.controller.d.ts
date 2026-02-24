import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
export declare const uploadBankTransfer: multer.Multer;
export declare function uploadBankTransferImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=upload.controller.d.ts.map