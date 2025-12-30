import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare function createContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getContacts(req: AuthRequest, res: Response): Promise<void>;
export declare function updateContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteContact(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=contacts.controller.d.ts.map